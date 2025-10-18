import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock } from 'lucide-react';
import { ReceptionReport } from '@/types/reportTypes';

interface PatientReportSearchBarProps {
  onReportSelect: (report: ReceptionReport) => void;
}

const PatientReportSearchBar: React.FC<PatientReportSearchBarProps> = ({ onReportSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ReceptionReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        searchReports();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchReports = async () => {
    setLoading(true);
    try {
      const trimmedSearch = searchTerm.trim();
      if (!trimmedSearch) {
        setSearchResults([]);
        return;
      }

      // Build OR conditions for all searchable patient fields
      const conditions = [
        `name.ilike.%${trimmedSearch}%`,
        `phone_number.ilike.%${trimmedSearch}%`,
        `cnic.ilike.%${trimmedSearch}%`
      ];
      
      // If the search term is numeric, also search patient_id
      if (/^\d+$/.test(trimmedSearch)) {
        conditions.push(`patient_id.eq.${parseInt(trimmedSearch)}`);
      }

      // First, find matching patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, patient_id, name, age, gender, phone_number')
        .or(conditions.join(','));

      if (patientsError) throw patientsError;

      if (!patientsData || patientsData.length === 0) {
        setSearchResults([]);
        return;
      }

      const patientIds = patientsData.map(p => p.id);

      // Then get their latest reception reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('patient_reports')
        .select('id, patient_id, created_at, report_number')
        .eq('created_by_role', 'reception')
        .in('patient_id', patientIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (reportsError) throw reportsError;

      const patientMap = new Map(patientsData.map(p => [p.id, p]));

      const reportsWithPatients = reportsData?.map(report => {
        const patient = patientMap.get(report.patient_id);
        if (!patient) return null;

        return {
          id: report.id,
          report_id: report.report_number || 0,
          patient_id: report.patient_id,
          created_at: report.created_at,
          patient: {
            id: patient.id,
            patient_id: patient.patient_id,
            name: patient.name || 'Unknown Patient',
            age: patient.age || 0,
            gender: patient.gender || 'unknown',
            phone_number: patient.phone_number || ''
          }
        } as ReceptionReport;
      }).filter(report => report !== null) as ReceptionReport[];

      setSearchResults(reportsWithPatients.slice(0, 10));
    } catch (error) {
      console.error('Error searching reports:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search Reception Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Search by patient name, ID, phone, CNIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Searching reports...</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Found {searchResults.length} reports:</p>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchResults.map((report) => {
                const { date, time } = formatDateTime(report.created_at);
                return (
                  <div
                    key={report.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onReportSelect(report)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-600">Report #{report.report_id}</span>
                          <span className="text-xs text-gray-500">({report.id.slice(0, 8)})</span>
                        </div>
                        <p className="font-medium">{report.patient.name}</p>
                        <p className="text-sm text-gray-600">
                          Patient ID: {report.patient.patient_id} | Age: {report.patient.age} | Phone: {report.patient.phone_number}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{date} at {time}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Select
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {searchTerm && !loading && searchResults.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>No reception reports found matching "{searchTerm}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientReportSearchBar;
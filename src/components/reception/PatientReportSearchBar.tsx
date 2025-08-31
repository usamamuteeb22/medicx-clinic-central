

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ReceptionReport, Patient } from '@/types/reportTypes';

interface PatientReportSearchBarProps {
  onReportSelect: (report: ReceptionReport) => void;
}

const PatientReportSearchBar: React.FC<PatientReportSearchBarProps> = ({
  onReportSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ReceptionReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchReports();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchReports = async () => {
    setLoading(true);
    try {
      // First, get the latest reception reports with report_number
      const { data: reportsData, error: reportsError } = await supabase
        .from('patient_reports')
        .select('id, patient_id, created_at, report_number')
        .eq('created_by_role', 'reception')
        .order('created_at', { ascending: false })
        .limit(100);

      if (reportsError) throw reportsError;

      if (!reportsData || reportsData.length === 0) {
        setSearchResults([]);
        return;
      }

      // Get unique patient IDs
      const patientIds = [...new Set(reportsData.map(report => report.patient_id))];

      // Fetch patient details for these IDs
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, patient_id, name, age, gender, phone_number, cnic')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      // Create a map of patient data for quick lookup
      const patientsMap = new Map(patientsData?.map(patient => [patient.id, patient]) || []);

      // Transform data using the actual report_number from database
      const reportsWithPatients = reportsData?.map((report) => {
        const patient = patientsMap.get(report.patient_id);
        
        if (!patient) return null;

        return {
          id: report.id,
          report_id: report.report_number || 2000, // Use actual report_number or fallback
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

      // Filter results based on search term
      const filteredResults = reportsWithPatients.filter(report => {
        const searchLower = searchTerm.toLowerCase();
        return (
          report.report_id.toString().includes(searchTerm) ||
          report.patient.name.toLowerCase().includes(searchLower) ||
          report.patient.patient_id.toString().includes(searchTerm) ||
          (report.patient.phone_number && report.patient.phone_number.includes(searchTerm)) ||
          ((patientsMap.get(report.patient_id) as any)?.cnic && (patientsMap.get(report.patient_id) as any).cnic.includes(searchTerm))
        );
      });

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching reports:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search Reception Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search by Report ID, Patient Name, Patient ID, Phone Number, or CNIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {loading && (
            <div className="text-center py-4">
              <div className="text-gray-500">Searching...</div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.report_id}</TableCell>
                      <TableCell>{report.patient.name}</TableCell>
                      <TableCell>{report.patient.patient_id}</TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>{report.patient.phone_number || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReportSelect(report)}
                        >
                          Select Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {searchTerm.trim() && !loading && searchResults.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No reports found matching your search criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientReportSearchBar;


import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface ReceptionReport {
  id: string;
  report_id: number;
  patient_id: string;
  created_at: string;
  patient: Patient;
}

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
      // Search in patient_reports table with reception role filter
      const { data: reportsData, error } = await supabase
        .from('patient_reports')
        .select('*')
        .eq('created_by_role', 'reception')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      // Fetch patient data for each report and assign sequential report IDs
      const reportsWithPatients = await Promise.all(
        reportsData?.map(async (report, index) => {
          const { data: patientData } = await supabase
            .from('patients')
            .select('*')
            .eq('id', report.patient_id)
            .single();

          // Sequential report ID starting from 2001 based on creation order
          const reportId = 2001 + index;

          return {
            id: report.id,
            report_id: reportId,
            patient_id: report.patient_id,
            created_at: report.created_at,
            patient: patientData || {
              id: report.patient_id,
              patient_id: 0,
              name: 'Unknown Patient',
              age: 0,
              gender: 'unknown',
              phone_number: ''
            }
          };
        }) || []
      );

      // Filter results based on search term
      const filteredResults = reportsWithPatients.filter(report => {
        const searchLower = searchTerm.toLowerCase();
        return (
          report.report_id.toString().includes(searchTerm) ||
          report.patient.name.toLowerCase().includes(searchLower) ||
          report.patient.patient_id.toString().includes(searchTerm) ||
          (report.patient.phone_number && report.patient.phone_number.includes(searchTerm))
        );
      });

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching reports:', error);
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
            placeholder="Search by Report ID, Patient Name, Patient ID, or Phone Number..."
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

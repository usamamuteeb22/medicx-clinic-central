
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock } from 'lucide-react';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  phone_number: string;
}

interface ReceptionReport {
  id: string;
  patient_id: string;
  created_at: string;
  report_number: number;
  patient: Patient;
}

const LatestReceptionReportsTable: React.FC = () => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['latestReceptionReports'],
    queryFn: async () => {
      const { data: reportsData, error: reportsError } = await supabase
        .from('patient_reports')
        .select('id, patient_id, created_at, report_number')
        .eq('created_by_role', 'reception')
        .order('created_at', { ascending: false })
        .limit(10);

      if (reportsError) throw reportsError;

      if (!reportsData || reportsData.length === 0) {
        return [];
      }

      const patientIds = [...new Set(reportsData.map(report => report.patient_id))];

      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, patient_id, name, phone_number')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      const patientMap = new Map(patientsData?.map(p => [p.id, p]) || []);

      return reportsData.map(report => ({
        ...report,
        patient: patientMap.get(report.patient_id)
      })).filter(report => report.patient) as ReceptionReport[];
    },
    refetchInterval: 30000
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { dateStr, timeStr };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Latest 10 Reception Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No reception reports found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Report ID</TableHead>
                  <TableHead className="font-semibold">Patient ID</TableHead>
                  <TableHead className="font-semibold">Patient Name</TableHead>
                  <TableHead className="font-semibold">Phone Number</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const { dateStr, timeStr } = formatDateTime(report.created_at);
                  return (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{report.report_number || 'N/A'}</TableCell>
                      <TableCell>{report.patient?.patient_id || 'N/A'}</TableCell>
                      <TableCell>{report.patient?.name || 'Unknown'}</TableCell>
                      <TableCell>{report.patient?.phone_number || 'N/A'}</TableCell>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell>{timeStr}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestReceptionReportsTable;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface PatientReport {
  id: string;
  patient_id: string;
  created_at: string;
  status: string;
  patients: Patient;
}

interface ReportsTableProps {
  reports: PatientReport[] | undefined;
  isLoading: boolean;
}

const ReportsTable: React.FC<ReportsTableProps> = ({ reports, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading reports...</div>
        ) : reports && reports.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono text-sm">
                      {report.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.patients.name}</div>
                        <div className="text-sm text-gray-500">
                          ID: {report.patients.patient_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={report.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No reports found. Create your first report to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsTable;

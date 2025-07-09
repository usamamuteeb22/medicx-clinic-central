
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

interface PatientsTableProps {
  patients: Patient[];
}

const PatientsTable: React.FC<PatientsTableProps> = ({ patients }) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Registration Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No patients found
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.patient_id}</TableCell>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.category || 'N/A'}</TableCell>
                <TableCell>{patient.phone_number || 'N/A'}</TableCell>
                <TableCell>{patient.address || 'N/A'}</TableCell>
                <TableCell>
                  {new Date(patient.registration_date || '').toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientsTable;

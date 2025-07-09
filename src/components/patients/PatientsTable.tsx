
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

interface PatientsTableProps {
  patients: Patient[];
  onEdit?: (patientId: string) => void;
}

const PatientsTable: React.FC<PatientsTableProps> = ({ patients, onEdit }) => {
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
            {onEdit && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onEdit ? 9 : 8} className="text-center py-4">
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
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patient.category === 'Paid' 
                      ? 'bg-green-100 text-green-800'
                      : patient.category === 'Free'
                      ? 'bg-blue-100 text-blue-800'
                      : patient.category === 'Thalassemic'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.category || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>{patient.phone_number || 'N/A'}</TableCell>
                <TableCell>{patient.address || 'N/A'}</TableCell>
                <TableCell>
                  {new Date(patient.registration_date || '').toLocaleDateString()}
                </TableCell>
                {onEdit && (
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(patient.id)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientsTable;

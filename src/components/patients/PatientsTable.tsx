
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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getCategoryBadgeStyle = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    switch (category.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'free':
        return 'bg-blue-100 text-blue-800';
      case 'thalassemic':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!patients || patients.length === 0) {
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
            <TableRow>
              <TableCell colSpan={onEdit ? 9 : 8} className="text-center py-8">
                No patients found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
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
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-mono">{patient.patient_id || 'N/A'}</TableCell>
              <TableCell className="font-medium">{patient.name || 'N/A'}</TableCell>
              <TableCell>{patient.age || 'N/A'}</TableCell>
              <TableCell className="capitalize">{patient.gender || 'N/A'}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeStyle(patient.category)}`}>
                  {patient.category || 'N/A'}
                </span>
              </TableCell>
              <TableCell>{patient.phone_number || 'N/A'}</TableCell>
              <TableCell className="max-w-xs truncate">{patient.address || 'N/A'}</TableCell>
              <TableCell>{formatDate(patient.registration_date)}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientsTable;

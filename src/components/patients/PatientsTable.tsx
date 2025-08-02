
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age?: number;
  age_years?: number;
  age_months?: number;
  age_days?: number;
  gender: string;
  phone_number: string;
  cnic?: string;
  category?: string;
  registration_date: string;
}

interface PatientsTableProps {
  patients: Patient[];
  onDeletePatient: (id: string) => void;
}

const PatientsTable: React.FC<PatientsTableProps> = ({ patients, onDeletePatient }) => {
  const navigate = useNavigate();

  const formatAge = (patient: Patient) => {
    if (patient.age_years || patient.age_months || patient.age_days) {
      const parts = [];
      if (patient.age_years && patient.age_years > 0) parts.push(`${patient.age_years}y`);
      if (patient.age_months && patient.age_months > 0) parts.push(`${patient.age_months}m`);
      if (patient.age_days && patient.age_days > 0) parts.push(`${patient.age_days}d`);
      return parts.join(' ') || 'N/A';
    }
    return patient.age ? `${patient.age}y` : 'N/A';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Patient ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Age
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Gender
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              CNIC
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Registration Date
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {patient.patient_id}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {patient.name}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatAge(patient)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {patient.gender}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {patient.phone_number || 'N/A'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {patient.cnic || 'N/A'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  patient.category === 'Paid' ? 'bg-green-100 text-green-800' :
                  patient.category === 'Free' ? 'bg-blue-100 text-blue-800' :
                  patient.category === 'Thalassemic' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {patient.category || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(patient.registration_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/patients/${patient.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeletePatient(patient.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsTable;

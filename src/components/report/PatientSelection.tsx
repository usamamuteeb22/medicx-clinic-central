
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import PatientSelector from '@/components/PatientSelector';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface PatientSelectionProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
}

const PatientSelection: React.FC<PatientSelectionProps> = ({
  selectedPatient,
  onPatientSelect
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Select Patient</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PatientSelector 
          selectedPatient={selectedPatient}
          onPatientSelect={onPatientSelect}
        />
      </CardContent>
    </Card>
  );
};

export default PatientSelection;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from 'lucide-react';
import MedicinePrescriptionForm from '@/components/MedicinePrescriptionForm';

interface Medicine {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
}

interface PrescribedMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

interface MedicinePrescriptionSectionProps {
  prescribedMedicines: PrescribedMedicine[];
  onPrescribedMedicinesChange: (medicines: PrescribedMedicine[]) => void;
}

const MedicinePrescriptionSection: React.FC<MedicinePrescriptionSectionProps> = ({
  prescribedMedicines,
  onPrescribedMedicinesChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pill className="h-5 w-5" />
          <span>Medicine Prescription</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MedicinePrescriptionForm
          prescribedMedicines={prescribedMedicines}
          onPrescribedMedicinesChange={onPrescribedMedicinesChange}
        />
      </CardContent>
    </Card>
  );
};

export default MedicinePrescriptionSection;

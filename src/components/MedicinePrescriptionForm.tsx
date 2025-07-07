
import React from 'react';
import MedicineSearchForm from './prescription/MedicineSearchForm';
import PrescribedMedicinesList from './prescription/PrescribedMedicinesList';

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

interface MedicinePrescriptionFormProps {
  prescribedMedicines: PrescribedMedicine[];
  onPrescribedMedicinesChange: (medicines: PrescribedMedicine[]) => void;
}

const MedicinePrescriptionForm: React.FC<MedicinePrescriptionFormProps> = ({
  prescribedMedicines,
  onPrescribedMedicinesChange
}) => {
  const handleAddMedicine = (medicine: PrescribedMedicine) => {
    onPrescribedMedicinesChange([...prescribedMedicines, medicine]);
  };

  const handleRemoveMedicine = (id: string) => {
    onPrescribedMedicinesChange(prescribedMedicines.filter(pm => pm.id !== id));
  };

  return (
    <div className="space-y-6">
      <MedicineSearchForm
        prescribedMedicines={prescribedMedicines}
        onAddMedicine={handleAddMedicine}
      />
      <PrescribedMedicinesList
        prescribedMedicines={prescribedMedicines}
        onRemoveMedicine={handleRemoveMedicine}
      />
    </div>
  );
};

export default MedicinePrescriptionForm;

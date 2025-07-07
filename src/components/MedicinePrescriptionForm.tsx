
import React from 'react';
import ModernMedicineSearch from './prescription/ModernMedicineSearch';
import PrescribedMedicinesList from './prescription/PrescribedMedicinesList';

interface Medicine {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
}

interface DoctorPrescribedMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  morning: boolean;
  afternoon?: boolean;
  evening: boolean;
  night: boolean;
}

interface MedicinePrescriptionFormProps {
  reportId?: string;
  prescribedMedicines: DoctorPrescribedMedicine[];
  onPrescribedMedicinesChange: (medicines: DoctorPrescribedMedicine[]) => void;
}

const MedicinePrescriptionForm: React.FC<MedicinePrescriptionFormProps> = ({
  reportId,
  prescribedMedicines,
  onPrescribedMedicinesChange
}) => {
  const handleAddMedicine = (medicine: DoctorPrescribedMedicine) => {
    onPrescribedMedicinesChange([...prescribedMedicines, medicine]);
  };

  const handleRemoveMedicine = (id: string) => {
    onPrescribedMedicinesChange(prescribedMedicines.filter(pm => pm.id !== id));
  };

  return (
    <div className="space-y-6">
      <ModernMedicineSearch
        reportId={reportId}
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

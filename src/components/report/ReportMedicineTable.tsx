
import React from 'react';

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
  afternoon?: boolean;
  evening: boolean;
  night: boolean;
}

interface ReportMedicineTableProps {
  prescribedMedicines: PrescribedMedicine[];
}

const ReportMedicineTable: React.FC<ReportMedicineTableProps> = ({ 
  prescribedMedicines 
}) => {
  const getDosageText = (medicine: PrescribedMedicine) => {
    const times = [];
    if (medicine.morning) times.push('Morning');
    if (medicine.afternoon) times.push('Afternoon');
    if (medicine.evening) times.push('Evening');
    if (medicine.night) times.push('Night');
    return times.length > 0 ? times.join(', ') : 'Not Specified';
  };

  // Only show medicines that are actually prescribed
  const activeMedicines = prescribedMedicines.filter(medicine => medicine.quantity > 0);

  // Don't render the section if no medicines are prescribed
  if (activeMedicines.length === 0) {
    return null;
  }

  return (
    <div className="medicine-section">
      <h3>Prescribed Medicines</h3>
      <table className="medicine-table">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Dosage Timing</th>
          </tr>
        </thead>
        <tbody>
          {activeMedicines.map((medicine, index) => (
            <tr key={index}>
              <td>{medicine.medicine.name}</td>
              <td className="capitalize">{medicine.medicine.category}</td>
              <td>{medicine.quantity}</td>
              <td>{getDosageText(medicine)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportMedicineTable;

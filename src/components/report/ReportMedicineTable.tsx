
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
    if (medicine.evening) times.push('Evening');
    if (medicine.night) times.push('Night');
    return times.length > 0 ? times.join(', ') : 'Not Specified';
  };

  return (
    <div className="section medicine-section">
      <div className="section-title">Prescribed Medicines</div>
      <table className="medicine-table">
        <thead>
          <tr>
            <th style={{width: '30%'}}>Medicine</th>
            <th style={{width: '20%'}}>Category</th>
            <th style={{width: '15%'}}>Quantity</th>
            <th style={{width: '35%'}}>Dosage Timing</th>
          </tr>
        </thead>
        <tbody>
          {prescribedMedicines.slice(0, 6).map((medicine, index) => (
            <tr key={index}>
              <td>{medicine.medicine.name}</td>
              <td className="capitalize">{medicine.medicine.category}</td>
              <td>{medicine.quantity}</td>
              <td>{getDosageText(medicine)}</td>
            </tr>
          ))}
          {prescribedMedicines.length === 0 && (
            <tr>
              <td colSpan={4} style={{textAlign: 'center', color: '#666'}}>No medicines prescribed</td>
            </tr>
          )}
          {/* Fill empty rows to maintain consistent spacing */}
          {Array.from({ length: Math.max(0, 6 - prescribedMedicines.length) }).map((_, index) => (
            <tr key={`empty-${index}`}>
              <td>--</td>
              <td>--</td>
              <td>--</td>
              <td>--</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportMedicineTable;

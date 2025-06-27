
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Medicine {
  name: string;
  quantity: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

interface MedicineUsageRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_number: number;
  report_date: string;
  medicines: Medicine[];
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateMedicineUsagePDF = (records: MedicineUsageRecord[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  doc.text('Medicine Usage Summary Report', 20, 20);
  
  // Generated date
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy hh:mm:ss a')}`, 20, 30);
  
  let yPosition = 45;
  
  records.forEach((record, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Patient info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Patient: ${record.patient_name} (ID: ${record.patient_number})`, 20, yPosition);
    yPosition += 7;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Report Date: ${format(new Date(record.report_date), 'MMM dd, yyyy hh:mm:ss a')}`, 20, yPosition);
    yPosition += 10;
    
    // Medicines table
    if (record.medicines.length > 0) {
      const tableData = record.medicines.map(med => [
        med.name,
        med.quantity.toString(),
        [
          med.morning && 'Morning',
          med.afternoon && 'Afternoon',
          med.evening && 'Evening',
          med.night && 'Night'
        ].filter(Boolean).join(', ') || 'Not specified'
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [['Medicine Name', 'Quantity', 'Timing']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 20 },
        styles: { fontSize: 9 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.text('No medicines prescribed', 20, yPosition);
      yPosition += 15;
    }
  });
  
  // Total records
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Records: ${records.length}`, 20, yPosition + 10);
  
  // Save the PDF
  doc.save(`medicine-usage-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};


import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface MedicineUsageRecord {
  id: string;
  patient_name: string;
  patient_number: number;
  report_date: string;
  medicines: Array<{
    name: string;
    quantity: number;
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  }>;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateMedicineUsagePDF = (records: MedicineUsageRecord[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229); // Indigo color
  doc.text('Medicine Usage Report', 20, 20);
  
  // Generated date
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray color
  doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy hh:mm:ss a')}`, 20, 30);
  
  // Flatten the data for table
  const tableData: any[] = [];
  records.forEach(record => {
    record.medicines.forEach(medicine => {
      const timings = [];
      if (medicine.morning) timings.push('Morning');
      if (medicine.afternoon) timings.push('Afternoon');
      if (medicine.evening) timings.push('Evening');
      if (medicine.night) timings.push('Night');
      
      tableData.push([
        record.patient_number.toString(),
        record.patient_name,
        medicine.name,
        medicine.quantity.toString(),
        timings.join(', '),
        format(new Date(record.report_date), 'MMM dd, yyyy')
      ]);
    });
  });
  
  // Create table
  doc.autoTable({
    startY: 40,
    head: [['Patient ID', 'Patient Name', 'Medicine', 'Quantity', 'Dosage Times', 'Report Date']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [79, 70, 229], // Indigo color
      textColor: [255, 255, 255],
      fontSize: 10
    },
    styles: { 
      fontSize: 9,
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Light gray
    }
  });
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // Green color
  doc.text(`Total Records: ${records.length}`, 20, finalY);
  doc.text(`Total Medicine Entries: ${tableData.length}`, 20, finalY + 10);
  
  // Save the PDF
  doc.save(`medicine-usage-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};


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
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('Medicine Usage Report', 20, 25);
    
    // Generated date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy hh:mm:ss a')}`, 20, 35);
    
    // Flatten the data for table
    const tableData: any[] = [];
    records.forEach(record => {
      if (record.medicines && record.medicines.length > 0) {
        record.medicines.forEach(medicine => {
          const timings = [];
          if (medicine.morning) timings.push('Morning');
          if (medicine.afternoon) timings.push('Afternoon');
          if (medicine.evening) timings.push('Evening');
          if (medicine.night) timings.push('Night');
          
          tableData.push([
            record.patient_number.toString(),
            record.patient_name || 'N/A',
            medicine.name || 'N/A',
            medicine.quantity.toString(),
            timings.join(', ') || 'N/A',
            record.report_date ? format(new Date(record.report_date), 'MMM dd, yyyy') : 'N/A'
          ]);
        });
      }
    });
    
    // Create table
    doc.autoTable({
      startY: 45,
      head: [['Patient ID', 'Patient Name', 'Medicine', 'Quantity', 'Dosage Times', 'Report Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 4,
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { halign: 'center' },
        3: { halign: 'center' },
        5: { halign: 'center' }
      }
    });
    
    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text(`Total Records: ${records.length}`, 20, finalY);
    doc.text(`Total Medicine Entries: ${tableData.length}`, 20, finalY + 10);
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`medicine-usage-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

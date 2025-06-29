
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Medicine {
  id: string;
  name: string;
  category: string;
  serial_number: number;
  total_quantity: number;
  expiry_date: string;
  last_updated: string;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateMedicineStockPDF = (medicines: Medicine[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229); // Indigo color
  doc.text('Medicine Stock Inventory Report', 20, 20);
  
  // Generated date
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray color
  doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy hh:mm:ss a')}`, 20, 30);
  
  // Table data
  const tableData = medicines.map(medicine => [
    medicine.serial_number.toString(),
    medicine.name,
    medicine.category,
    medicine.total_quantity.toString(),
    medicine.expiry_date ? format(new Date(medicine.expiry_date), 'MMM dd, yyyy') : 'N/A',
    format(new Date(medicine.last_updated), 'MMM dd, yyyy')
  ]);
  
  // Create table
  doc.autoTable({
    startY: 40,
    head: [['Serial No.', 'Medicine Name', 'Category', 'Stock Qty', 'Expiry Date', 'Last Updated']],
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
  doc.text(`Total Medicines: ${medicines.length}`, 20, finalY);
  
  // Low stock warning
  const lowStockMedicines = medicines.filter(m => m.total_quantity < 10);
  if (lowStockMedicines.length > 0) {
    doc.setTextColor(239, 68, 68); // Red color
    doc.text(`⚠️ Low Stock Alert: ${lowStockMedicines.length} medicines have less than 10 units`, 20, finalY + 10);
  }
  
  // Save the PDF
  doc.save(`medicine-stock-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

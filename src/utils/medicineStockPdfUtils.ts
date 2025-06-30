
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
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('Medicine Stock Inventory Report', 20, 25);
    
    // Generated date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy hh:mm:ss a')}`, 20, 35);
    
    // Table data
    const tableData = medicines.map(medicine => [
      medicine.serial_number.toString(),
      medicine.name || 'N/A',
      medicine.category || 'N/A',
      medicine.total_quantity.toString(),
      medicine.expiry_date ? format(new Date(medicine.expiry_date), 'MMM dd, yyyy') : 'N/A',
      medicine.last_updated ? format(new Date(medicine.last_updated), 'MMM dd, yyyy') : 'N/A'
    ]);
    
    // Create table
    doc.autoTable({
      startY: 45,
      head: [['Serial No.', 'Medicine Name', 'Category', 'Stock Qty', 'Expiry Date', 'Last Updated']],
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
        4: { halign: 'center' },
        5: { halign: 'center' }
      }
    });
    
    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text(`Total Medicines: ${medicines.length}`, 20, finalY);
    
    // Low stock warning
    const lowStockMedicines = medicines.filter(m => m.total_quantity < 10);
    if (lowStockMedicines.length > 0) {
      doc.setTextColor(239, 68, 68);
      doc.text(`⚠️ Low Stock Alert: ${lowStockMedicines.length} medicines have less than 10 units`, 20, finalY + 10);
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`medicine-stock-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

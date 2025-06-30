
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface Medicine {
  id: string;
  name: string;
  category: string;
  serial_number: number;
  total_quantity: number;
  expiry_date: string;
  last_updated: string;
}

export const generateMedicineStockExcel = (medicines: Medicine[]) => {
  try {
    // Prepare data for Excel
    const worksheetData = medicines.map(medicine => ({
      'Serial No.': medicine.serial_number,
      'Medicine Name': medicine.name || 'N/A',
      'Category': medicine.category || 'N/A',
      'Stock Quantity': medicine.total_quantity,
      'Expiry Date': medicine.expiry_date ? format(new Date(medicine.expiry_date), 'MMM dd, yyyy') : 'N/A',
      'Last Updated': medicine.last_updated ? format(new Date(medicine.last_updated), 'MMM dd, yyyy') : 'N/A'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Serial No.
      { wch: 25 }, // Medicine Name
      { wch: 15 }, // Category
      { wch: 15 }, // Stock Quantity
      { wch: 15 }, // Expiry Date
      { wch: 15 }  // Last Updated
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicine Stock');

    // Add summary data
    const summaryData = [
      { 'Summary': 'Total Medicines', 'Value': medicines.length },
      { 'Summary': 'Low Stock Alert (< 10 units)', 'Value': medicines.filter(m => m.total_quantity < 10).length },
      { 'Summary': 'Generated On', 'Value': format(new Date(), 'MMM dd, yyyy hh:mm:ss a') }
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Generate and download file
    const fileName = `medicine-stock-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw new Error('Failed to generate Excel file');
  }
};

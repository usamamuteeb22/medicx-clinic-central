
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

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

export const generateMedicineUsageExcel = (records: MedicineUsageRecord[]) => {
  try {
    // Flatten the data for Excel
    const worksheetData: any[] = [];
    records.forEach(record => {
      if (record.medicines && record.medicines.length > 0) {
        record.medicines.forEach(medicine => {
          const timings = [];
          if (medicine.morning) timings.push('Morning');
          if (medicine.afternoon) timings.push('Afternoon');
          if (medicine.evening) timings.push('Evening');
          if (medicine.night) timings.push('Night');
          
          worksheetData.push({
            'Patient ID': record.patient_number,
            'Patient Name': record.patient_name || 'N/A',
            'Medicine': medicine.name || 'N/A',
            'Quantity': medicine.quantity,
            'Dosage Times': timings.join(', ') || 'N/A',
            'Report Date': record.report_date ? format(new Date(record.report_date), 'MMM dd, yyyy') : 'N/A'
          });
        });
      }
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Patient ID
      { wch: 20 }, // Patient Name
      { wch: 25 }, // Medicine
      { wch: 10 }, // Quantity
      { wch: 20 }, // Dosage Times
      { wch: 15 }  // Report Date
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicine Usage');

    // Add summary data
    const summaryData = [
      { 'Summary': 'Total Records', 'Value': records.length },
      { 'Summary': 'Total Medicine Entries', 'Value': worksheetData.length },
      { 'Summary': 'Generated On', 'Value': format(new Date(), 'MMM dd, yyyy hh:mm:ss a') }
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Generate and download file
    const fileName = `medicine-usage-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw new Error('Failed to generate Excel file');
  }
};

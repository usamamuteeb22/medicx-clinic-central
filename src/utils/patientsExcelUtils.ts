
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
  address: string;
  registration_date: string;
  description: string;
}

export const generatePatientsExcel = (patients: Patient[]) => {
  try {
    // Prepare data for Excel
    const worksheetData = patients.map(patient => ({
      'Patient ID': patient.patient_id,
      'Name': patient.name || 'N/A',
      'Age': patient.age,
      'Gender': patient.gender || 'N/A',
      'Phone': patient.phone_number || 'N/A',
      'Address': patient.address || 'N/A',
      'Registration Date': patient.registration_date ? format(new Date(patient.registration_date), 'MMM dd, yyyy') : 'N/A',
      'Description': patient.description || 'N/A'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Patient ID
      { wch: 20 }, // Name
      { wch: 8 },  // Age
      { wch: 10 }, // Gender
      { wch: 15 }, // Phone
      { wch: 25 }, // Address
      { wch: 18 }, // Registration Date
      { wch: 30 }  // Description
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients List');

    // Add summary data
    const maleCount = patients.filter(p => p.gender === 'Male').length;
    const femaleCount = patients.filter(p => p.gender === 'Female').length;
    
    const summaryData = [
      { 'Summary': 'Total Patients', 'Value': patients.length },
      { 'Summary': 'Male Patients', 'Value': maleCount },
      { 'Summary': 'Female Patients', 'Value': femaleCount },
      { 'Summary': 'Generated On', 'Value': format(new Date(), 'MMM dd, yyyy hh:mm:ss a') }
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Generate and download file
    const fileName = `patients-list-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw new Error('Failed to generate Excel file');
  }
};


import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePatientsPDF = (patients: Patient[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229); // Indigo color
  doc.text('Patients List Report', 20, 20);
  
  // Generated date
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray color
  doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy hh:mm:ss a')}`, 20, 30);
  
  // Table data
  const tableData = patients.map(patient => [
    patient.patient_id.toString(),
    patient.name,
    patient.age.toString(),
    patient.gender,
    patient.phone_number || 'N/A',
    patient.address || 'N/A',
    patient.registration_date ? format(new Date(patient.registration_date), 'MMM dd, yyyy') : 'N/A',
    patient.description || 'N/A'
  ]);
  
  // Create table
  doc.autoTable({
    startY: 40,
    head: [['Patient ID', 'Name', 'Age', 'Gender', 'Phone', 'Address', 'Registration Date', 'Description']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [79, 70, 229], // Indigo color
      textColor: [255, 255, 255],
      fontSize: 10
    },
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Light gray
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 15 },
      3: { cellWidth: 18 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
      6: { cellWidth: 25 },
      7: { cellWidth: 30 }
    }
  });
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // Green color
  doc.text(`Total Patients: ${patients.length}`, 20, finalY);
  
  // Gender summary
  const maleCount = patients.filter(p => p.gender === 'Male').length;
  const femaleCount = patients.filter(p => p.gender === 'Female').length;
  doc.text(`Male: ${maleCount} | Female: ${femaleCount}`, 20, finalY + 10);
  
  // Save the PDF
  doc.save(`patients-list-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

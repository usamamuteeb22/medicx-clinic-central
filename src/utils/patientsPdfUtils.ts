
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
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('Patients List Report', 20, 25);
    
    // Generated date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy hh:mm:ss a')}`, 20, 35);
    
    // Table data
    const tableData = patients.map(patient => [
      patient.patient_id.toString(),
      patient.name || 'N/A',
      patient.age.toString(),
      patient.gender || 'N/A',
      patient.phone_number || 'N/A',
      patient.address || 'N/A',
      patient.registration_date ? format(new Date(patient.registration_date), 'MMM dd, yyyy') : 'N/A',
      patient.description || 'N/A'
    ]);
    
    // Create table
    doc.autoTable({
      startY: 45,
      head: [['Patient ID', 'Name', 'Age', 'Gender', 'Phone', 'Address', 'Registration Date', 'Description']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3,
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
        6: { cellWidth: 25, halign: 'center' },
        7: { cellWidth: 30 }
      }
    });
    
    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text(`Total Patients: ${patients.length}`, 20, finalY);
    
    // Gender summary
    const maleCount = patients.filter(p => p.gender === 'Male').length;
    const femaleCount = patients.filter(p => p.gender === 'Female').length;
    doc.text(`Male: ${maleCount} | Female: ${femaleCount}`, 20, finalY + 10);
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`patients-list-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

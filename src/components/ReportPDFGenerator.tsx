import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import ReportHeader from './report/ReportHeader';
import ReportPatientInfo from './report/ReportPatientInfo';
import ReportVitals from './report/ReportVitals';
import ReportMedicineTable from './report/ReportMedicineTable';
import ReportMedicalHistory from './report/ReportMedicalHistory';
import ReportFooter from './report/ReportFooter';
import ReportPrintStyles from './report/ReportPrintStyles';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
}

interface PrescribedMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  morning: boolean;
  evening: boolean;
  night: boolean;
}

interface ReportData {
  hemoglobin: string;
  wbc: string;
  platelets: string;
  blood_pressure: string;
  temperature: string;
  weight: string;
  clinical_complaint: string;
  medical_history: string;
  observations: string;
  recommendations: string;
}

interface ReportPDFGeneratorProps {
  reportId: string;
  patient: Patient;
  reportData: ReportData;
  prescribedMedicines: PrescribedMedicine[];
  onClose: () => void;
}

const ReportPDFGenerator: React.FC<ReportPDFGeneratorProps> = ({
  reportId,
  patient,
  reportData,
  prescribedMedicines,
  onClose
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const handlePrint = () => {
    const printContent = document.getElementById('medical-report-print');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Medical Report - ${patient.name}</title>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Create a no-op function for the onFormDataChange prop since this is read-only
  const handleFormDataChange = () => {
    // No-op for read-only PDF view
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-4">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle>Medical Report Preview</DialogTitle>
            <div className="flex items-center space-x-2 no-print">
              <Button onClick={handlePrint} size="sm" className="flex items-center space-x-2">
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div id="medical-report-print" className="bg-white">
          <ReportPrintStyles />
          <div className="report-container">
            <ReportHeader 
              reportId={reportId}
              currentDate={currentDate}
              currentTime={currentTime}
            />

            <div className="content">
              <ReportPatientInfo patient={patient} />
              <ReportVitals 
                formData={reportData} 
                onFormDataChange={handleFormDataChange}
              />
              <ReportMedicineTable prescribedMedicines={prescribedMedicines} />
              <ReportMedicalHistory 
                formData={reportData} 
                onFormDataChange={handleFormDataChange}
              />
            </div>

            <ReportFooter />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPDFGenerator;


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
import PrintNotesSection from './report/PrintNotesSection';

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
  days: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  before_meal: boolean;
  after_meal: boolean;
  fasting: boolean;
  note?: string;
}

interface ReportData {
  blood_pressure: string;
  temperature: string;
  weight: string;
  bsr: string;
  saturation: string;
  clinical_complaint: string;
  medical_history: string;
  observations: string;
  recommendations: string;
  patient_history: string;
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
              <PrintNotesSection />
              <ReportMedicalHistory 
                formData={reportData} 
                onFormDataChange={handleFormDataChange}
              />
            </div>

            <ReportFooter />
          </div>
        </div>

        {/* Patient History Preview (only visible in preview, not print) */}
        {reportData.patient_history && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg print:hidden">
            <h3 className="font-semibold text-lg mb-2">Patient History (Preview Only)</h3>
            <p className="text-sm text-gray-700">{reportData.patient_history}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportPDFGenerator;

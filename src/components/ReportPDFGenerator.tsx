
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, X } from 'lucide-react';

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
              <style>
                @page {
                  size: A4 portrait;
                  margin: 5mm 7mm;
                }
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  font-family: 'Roboto', 'Arial', sans-serif;
                  font-size: 10pt;
                  line-height: 1.1;
                  color: #000;
                  height: 100vh;
                  width: 100%;
                }
                .report-container {
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                }
                
                /* Header Section - 15-17% of page height */
                .header {
                  height: 16%;
                  border-bottom: 1px solid #ccc;
                  padding: 3mm 0 2mm 0;
                  margin-bottom: 2mm;
                }
                .header-title {
                  text-align: center;
                  font-size: 17pt;
                  font-weight: bold;
                  margin-bottom: 4mm;
                  line-height: 1.2;
                }
                .header-content {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  font-size: 11pt;
                  margin-bottom: 2mm;
                }
                .doctor-info {
                  flex: 1;
                  line-height: 1.2;
                }
                .doctor-info h4 {
                  font-weight: bold;
                  margin-bottom: 1mm;
                  font-size: 12pt;
                }
                .doctor-info div {
                  margin-bottom: 0.5mm;
                }
                .timing-info {
                  text-align: right;
                  flex: 0 0 100px;
                  line-height: 1.2;
                }
                .timing-info h4 {
                  font-weight: bold;
                  margin-bottom: 1mm;
                  font-size: 12pt;
                }
                .report-meta {
                  text-align: right;
                  font-size: 10pt;
                  margin-top: 2mm;
                  line-height: 1.1;
                }
                
                /* Content Area - Dynamic height */
                .content {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 2mm;
                  min-height: 0;
                }
                
                /* Section Styling */
                .section {
                  border: 0.5px solid #ccc;
                  padding: 2mm 3mm;
                  background: #fff;
                  margin-bottom: 1mm;
                }
                .section-title {
                  font-weight: bold;
                  font-size: 11pt;
                  margin-bottom: 2mm;
                  border-bottom: 0.5px solid #ddd;
                  padding-bottom: 1mm;
                  line-height: 1.1;
                }
                
                /* Patient Information - Fixed 18mm height */
                .patient-section {
                  height: 18mm;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                }
                .patient-info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                  gap: 4mm;
                  font-size: 10pt;
                  line-height: 1.2;
                }
                .patient-info-item {
                  display: flex;
                  flex-direction: column;
                }
                .patient-info-item strong {
                  font-weight: bold;
                  margin-bottom: 0.5mm;
                }
                
                /* Medical Vitals - Fixed 18mm height */
                .vitals-section {
                  height: 18mm;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                }
                .vitals-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 4mm;
                  font-size: 10pt;
                  line-height: 1.2;
                }
                .vitals-row {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 4mm;
                }
                .vital-item {
                  display: flex;
                  flex-direction: column;
                }
                .vital-item strong {
                  font-weight: bold;
                  margin-bottom: 0.5mm;
                }
                
                /* Clinical Details - Max 24mm height */
                .clinical-section {
                  max-height: 24mm;
                  overflow: hidden;
                }
                .clinical-content {
                  font-size: 10pt;
                  line-height: 1.3;
                  text-align: justify;
                }
                
                /* Medicine Table - Dynamic height up to 60mm */
                .medicine-section {
                  max-height: 60mm;
                  overflow: hidden;
                }
                .medicine-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 10pt;
                  line-height: 1.1;
                }
                .medicine-table th {
                  background-color: #f8f9fa;
                  font-weight: bold;
                  font-size: 11pt;
                  padding: 2mm;
                  border: 0.5px solid #ccc;
                  text-align: left;
                  height: 8mm;
                }
                .medicine-table td {
                  padding: 2mm;
                  border: 0.5px solid #ccc;
                  text-align: left;
                  vertical-align: top;
                  height: 8mm;
                }
                
                /* Medical History - Dynamic height up to 60mm */
                .history-section {
                  flex: 1;
                  max-height: 60mm;
                  overflow: hidden;
                }
                .history-item {
                  margin-bottom: 2mm;
                }
                .history-item h4 {
                  font-weight: bold;
                  margin-bottom: 1mm;
                  font-size: 10pt;
                }
                .history-item p {
                  line-height: 1.3;
                  font-size: 10pt;
                  text-align: justify;
                  margin-bottom: 1mm;
                }
                
                /* Footer - 6-8% of page height */
                .footer {
                  height: 7%;
                  border-top: 1px solid #ccc;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 2mm 0;
                  margin-top: 2mm;
                  font-size: 10pt;
                  line-height: 1.2;
                }
                .footer-contact {
                  font-weight: bold;
                }
                .footer-address {
                  text-align: right;
                  font-weight: bold;
                  max-width: 60%;
                }
                
                @media print {
                  .no-print { display: none !important; }
                  body { print-color-adjust: exact; }
                }
              </style>
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

  const getDosageText = (medicine: PrescribedMedicine) => {
    const times = [];
    if (medicine.morning) times.push('Morning');
    if (medicine.evening) times.push('Evening');
    if (medicine.night) times.push('Night');
    return times.length > 0 ? times.join(', ') : 'Not Specified';
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
          <div className="report-container">
            
            {/* Header Section - 15-17% height */}
            <div className="header">
              <div className="header-title">
                Project: Awaam Dost Welfare Organization Kasur
              </div>
              <div className="header-content">
                <div className="doctor-info">
                  <h4>Dr. Muhammad Jaffar</h4>
                  <div>MBBS/MD</div>
                  <div>EX. Medical Officer</div>
                  <div>Children Hospital, Lahore</div>
                </div>
                <div className="doctor-info">
                  <h4>Dr. Muhammad Kamal</h4>
                  <div>MBBS, FCPS</div>
                  <div>Consultant: Pediatrician</div>
                  <div>DHQ Hospital Kasur</div>
                  <div>Ex Senior Registrar</div>
                  <div>Children Hospital & ICH, Lahore</div>
                </div>
                <div className="timing-info">
                  <h4>Timing</h4>
                  <div>3:00 pm to 6:00 pm</div>
                </div>
              </div>
              <div className="report-meta">
                Report ID: {reportId.slice(0, 8)} | Date: {currentDate} | Time: {currentTime}
              </div>
            </div>

            {/* Content Sections */}
            <div className="content">
              
              {/* Patient Information - Fixed 18mm height */}
              <div className="section patient-section">
                <div className="section-title">Patient Information</div>
                <div className="patient-info-grid">
                  <div className="patient-info-item">
                    <strong>Patient ID:</strong>
                    <span>{patient.patient_id}</span>
                  </div>
                  <div className="patient-info-item">
                    <strong>Name:</strong>
                    <span>{patient.name}</span>
                  </div>
                  <div className="patient-info-item">
                    <strong>Age:</strong>
                    <span>{patient.age} years</span>
                  </div>
                  <div className="patient-info-item">
                    <strong>Gender:</strong>
                    <span>{patient.gender}</span>
                  </div>
                  <div className="patient-info-item">
                    <strong>Phone:</strong>
                    <span>{patient.phone_number || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Medical Vitals - Fixed 18mm height */}
              <div className="section vitals-section">
                <div className="section-title">Medical Vitals</div>
                <div className="vitals-grid">
                  <div className="vitals-row">
                    {reportData.hemoglobin && (
                      <div className="vital-item">
                        <strong>Hemoglobin:</strong>
                        <span>{reportData.hemoglobin} g/dL</span>
                      </div>
                    )}
                    {reportData.wbc && (
                      <div className="vital-item">
                        <strong>WBC:</strong>
                        <span>{reportData.wbc}</span>
                      </div>
                    )}
                  </div>
                  <div className="vitals-row">
                    {reportData.platelets && (
                      <div className="vital-item">
                        <strong>Platelets:</strong>
                        <span>{reportData.platelets}</span>
                      </div>
                    )}
                    {reportData.blood_pressure && (
                      <div className="vital-item">
                        <strong>Blood Pressure:</strong>
                        <span>{reportData.blood_pressure} mmHg</span>
                      </div>
                    )}
                  </div>
                  <div className="vitals-row">
                    {reportData.temperature && (
                      <div className="vital-item">
                        <strong>Temperature:</strong>
                        <span>{reportData.temperature}°F</span>
                      </div>
                    )}
                    {reportData.weight && (
                      <div className="vital-item">
                        <strong>Weight:</strong>
                        <span>{reportData.weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Clinical Details - Max 24mm height */}
              {reportData.clinical_complaint && (
                <div className="section clinical-section">
                  <div className="section-title">Clinical Details</div>
                  <div className="clinical-content">
                    {reportData.clinical_complaint}
                  </div>
                </div>
              )}

              {/* Prescribed Medicines - Dynamic height up to 60mm */}
              <div className="section medicine-section">
                <div className="section-title">Prescribed Medicines</div>
                <table className="medicine-table">
                  <thead>
                    <tr>
                      <th style={{width: '30%'}}>Medicine</th>
                      <th style={{width: '20%'}}>Category</th>
                      <th style={{width: '15%'}}>Quantity</th>
                      <th style={{width: '35%'}}>Dosage Timing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescribedMedicines.slice(0, 6).map((medicine, index) => (
                      <tr key={index}>
                        <td>{medicine.medicine.name}</td>
                        <td className="capitalize">{medicine.medicine.category}</td>
                        <td>{medicine.quantity}</td>
                        <td>{getDosageText(medicine)}</td>
                      </tr>
                    ))}
                    {prescribedMedicines.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{textAlign: 'center', color: '#666'}}>No medicines prescribed</td>
                      </tr>
                    )}
                    {/* Fill empty rows to maintain consistent spacing */}
                    {Array.from({ length: Math.max(0, 6 - prescribedMedicines.length) }).map((_, index) => (
                      <tr key={`empty-${index}`}>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Medical History & Notes - Dynamic height up to 60mm */}
              <div className="section history-section">
                <div className="section-title">Medical History & Notes</div>
                {reportData.medical_history && (
                  <div className="history-item">
                    <h4>Medical History:</h4>
                    <p>{reportData.medical_history}</p>
                  </div>
                )}
                {reportData.observations && (
                  <div className="history-item">
                    <h4>Clinical Observations:</h4>
                    <p>{reportData.observations}</p>
                  </div>
                )}
                {reportData.recommendations && (
                  <div className="history-item">
                    <h4>Recommendations:</h4>
                    <p>{reportData.recommendations}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - 6-8% height */}
            <div className="footer">
              <div className="footer-contact">
                Contact: 0306-0200076
              </div>
              <div className="footer-address">
                Address: 194 near Naeem Safdar Dhera, Munir Shaheed Colony<br />
                Shahbaz Khan Road Kasur
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPDFGenerator;

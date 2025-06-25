
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
                  size: A4;
                  margin: 10mm;
                }
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  font-family: Arial, sans-serif;
                  font-size: 11px;
                  line-height: 1.2;
                  color: #000;
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                }
                .report-container {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  height: 100%;
                }
                
                /* Header Styles */
                .header {
                  height: 15%;
                  border-bottom: 1px solid #000;
                  padding: 8px 0;
                  margin-bottom: 8px;
                }
                .header-title {
                  text-align: center;
                  font-size: 16px;
                  font-weight: bold;
                  margin-bottom: 8px;
                }
                .header-content {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  font-size: 10px;
                }
                .doctor-info {
                  flex: 1;
                }
                .doctor-info h4 {
                  font-weight: bold;
                  margin-bottom: 2px;
                }
                .timing-info {
                  text-align: right;
                  flex: 0 0 120px;
                }
                .timing-info h4 {
                  font-weight: bold;
                  margin-bottom: 2px;
                }
                .report-meta {
                  text-align: right;
                  font-size: 9px;
                  margin-top: 4px;
                }
                
                /* Content Styles */
                .content {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                }
                .section {
                  border: 1px solid #ccc;
                  padding: 6px;
                  background: #fff;
                }
                .section-title {
                  font-weight: bold;
                  font-size: 12px;
                  margin-bottom: 4px;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 2px;
                }
                
                /* Patient Info */
                .patient-info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                  gap: 8px;
                  font-size: 10px;
                }
                .patient-info-item {
                  display: flex;
                  flex-direction: column;
                }
                .patient-info-item strong {
                  font-weight: bold;
                  margin-bottom: 1px;
                }
                
                /* Medical Vitals */
                .vitals-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 8px;
                  font-size: 10px;
                }
                .vitals-row {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 8px;
                }
                .vital-item {
                  display: flex;
                  flex-direction: column;
                }
                .vital-item strong {
                  font-weight: bold;
                  margin-bottom: 1px;
                }
                
                /* Clinical Details */
                .clinical-content {
                  font-size: 10px;
                  line-height: 1.3;
                  max-height: 45px;
                  overflow: hidden;
                }
                
                /* Medicine Table */
                .medicine-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 10px;
                }
                .medicine-table th,
                .medicine-table td {
                  border: 1px solid #ccc;
                  padding: 4px;
                  text-align: left;
                  vertical-align: top;
                }
                .medicine-table th {
                  background-color: #f5f5f5;
                  font-weight: bold;
                }
                
                /* Medical History */
                .history-section {
                  flex: 1;
                  font-size: 10px;
                }
                .history-item {
                  margin-bottom: 4px;
                }
                .history-item h4 {
                  font-weight: bold;
                  margin-bottom: 2px;
                }
                .history-item p {
                  line-height: 1.3;
                  max-height: 30px;
                  overflow: hidden;
                }
                
                /* Footer */
                .footer {
                  height: 8%;
                  border-top: 1px solid #000;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 6px 0;
                  margin-top: auto;
                  font-size: 10px;
                }
                .footer-contact {
                  font-weight: bold;
                }
                .footer-address {
                  text-align: right;
                  font-weight: bold;
                }
                
                @media print {
                  .no-print { display: none !important; }
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
            
            {/* Header Section */}
            <div className="header">
              <div className="header-title">
                Project : Awaam Dost Welfare Organization Kasur
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
                  <div>Consultant : Pediatrician</div>
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
              
              {/* Patient Information */}
              <div className="section">
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

              {/* Medical Vitals */}
              <div className="section">
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
                        <span>{reportData.blood_pressure}mmHg</span>
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

              {/* Clinical Details */}
              {reportData.clinical_complaint && (
                <div className="section">
                  <div className="section-title">Clinical Details</div>
                  <div className="clinical-content">
                    {reportData.clinical_complaint}
                  </div>
                </div>
              )}

              {/* Prescribed Medicines */}
              <div className="section">
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
                    {prescribedMedicines.slice(0, 5).map((medicine, index) => (
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
                    {/* Fill empty rows to maintain table structure */}
                    {Array.from({ length: Math.max(0, 5 - prescribedMedicines.length) }).map((_, index) => (
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

              {/* Medical History & Notes */}
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

            {/* Footer */}
            <div className="footer">
              <div className="footer-contact">
                Contact : 0306-0200076
              </div>
              <div className="footer-address">
                Address : 194 near Naeem Safdar Dhera, Munir Shaheed Colony<br />
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

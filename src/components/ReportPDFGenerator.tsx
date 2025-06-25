
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  const handlePrint = () => {
    const printContent = document.getElementById('pdf-report-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Patient Report - ${patient.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.4; }
                .custom-header { 
                  display: flex; 
                  align-items: center; 
                  justify-content: space-between; 
                  border-bottom: 2px solid #333; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px;
                  background: url('/lovable-uploads/2688fc7d-99b4-4724-9f2d-913690188200.png') no-repeat;
                  background-size: contain;
                  background-position: top left;
                  min-height: 120px;
                  position: relative;
                }
                .header-content {
                  width: 100%;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  padding-left: 80px;
                }
                .project-title {
                  text-align: center;
                  flex: 1;
                  font-size: 18px;
                  font-weight: bold;
                  margin: 0 20px;
                }
                .doctors-info {
                  display: flex;
                  justify-content: space-between;
                  width: 100%;
                  font-size: 12px;
                  margin-top: 10px;
                }
                .doctor-column {
                  flex: 1;
                  padding: 0 20px;
                }
                .timing-info {
                  text-align: right;
                  font-size: 12px;
                }
                .patient-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .vitals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
                .medicine-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .medicine-table th, .medicine-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .medicine-table th { background-color: #f5f5f5; }
                .signature-area { margin-top: 40px; text-align: right; }
                .custom-footer { 
                  margin-top: 40px; 
                  border-top: 1px solid #333; 
                  padding-top: 15px; 
                  display: flex; 
                  justify-content: space-between; 
                  font-size: 12px; 
                  color: #333;
                }
                .footer-contact { font-weight: bold; }
                .footer-address { text-align: right; }
                @media print { .no-print { display: none; } }
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
    return times.length > 0 ? times.join(', ') : 'Not specified';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Patient Medical Report</DialogTitle>
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

        <div id="pdf-report-content" className="space-y-6">
          {/* Custom Header */}
          <div className="custom-header">
            <div className="header-content">
              <div className="project-title">
                <h1 className="text-lg font-bold">Project : Awaam Dost Welfare Organization Kasur</h1>
                <div className="doctors-info">
                  <div className="doctor-column">
                    <div><strong>Dr. Muhammad Jaffar</strong></div>
                    <div>MBBS/MD</div>
                    <div>EX. Medical Officer</div>
                    <div>Children Hospital, Lahore</div>
                  </div>
                  <div className="doctor-column">
                    <div><strong>Dr. Muhammad Kamal</strong></div>
                    <div>MBBS, FCPS</div>
                    <div>Consultant : Pediatrician</div>
                    <div>DHQ Hospital Kasur</div>
                    <div>Ex Senior Registrar</div>
                    <div>Children Hospital & ICH, Lahore</div>
                  </div>
                  <div className="timing-info">
                    <div><strong>Timing</strong></div>
                    <div>3:00 pm to 6:00 pm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="flex justify-between text-sm">
              <span>Report ID: {reportId.slice(0, 8)}</span>
              <span>Date: {currentDate} | Time: {currentTime}</span>
            </div>
          </div>

          {/* Patient Information */}
          <Card>
            <CardContent className="pt-4">
              <h2 className="text-lg font-semibold mb-3">Patient Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">Name:</span> {patient.name}
                </div>
                <div>
                  <span className="font-medium">Patient ID:</span> {patient.patient_id}
                </div>
                <div>
                  <span className="font-medium">Age:</span> {patient.age} years
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {patient.gender}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Phone:</span> {patient.phone_number || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Vitals */}
          <Card>
            <CardContent className="pt-4">
              <h2 className="text-lg font-semibold mb-3">Medical Vitals</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {reportData.hemoglobin && (
                  <div><span className="font-medium">Hemoglobin:</span> {reportData.hemoglobin} g/dL</div>
                )}
                {reportData.wbc && (
                  <div><span className="font-medium">WBC:</span> {reportData.wbc}</div>
                )}
                {reportData.platelets && (
                  <div><span className="font-medium">Platelets:</span> {reportData.platelets}</div>
                )}
                {reportData.blood_pressure && (
                  <div><span className="font-medium">Blood Pressure:</span> {reportData.blood_pressure} mmHg</div>
                )}
                {reportData.temperature && (
                  <div><span className="font-medium">Temperature:</span> {reportData.temperature}°F</div>
                )}
                {reportData.weight && (
                  <div><span className="font-medium">Weight:</span> {reportData.weight} kg</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Complaint */}
          {reportData.clinical_complaint && (
            <Card>
              <CardContent className="pt-4">
                <h2 className="text-lg font-semibold mb-3">Clinical Complaint</h2>
                <p className="text-gray-700">{reportData.clinical_complaint}</p>
              </CardContent>
            </Card>
          )}

          {/* Prescribed Medicines */}
          <Card>
            <CardContent className="pt-4">
              <h2 className="text-lg font-semibold mb-3">Prescribed Medicines</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Medicine</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Dosage Timing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescribedMedicines.map((medicine, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{medicine.medicine.name}</td>
                        <td className="border border-gray-300 px-4 py-2 capitalize">{medicine.medicine.category}</td>
                        <td className="border border-gray-300 px-4 py-2">{medicine.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2">{getDosageText(medicine)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Medical History & Notes */}
          {(reportData.medical_history || reportData.observations || reportData.recommendations) && (
            <Card>
              <CardContent className="pt-4">
                <h2 className="text-lg font-semibold mb-3">Medical History & Notes</h2>
                <div className="space-y-3">
                  {reportData.medical_history && (
                    <div>
                      <h3 className="font-medium">Medical History:</h3>
                      <p className="text-gray-700">{reportData.medical_history}</p>
                    </div>
                  )}
                  {reportData.observations && (
                    <div>
                      <h3 className="font-medium">Clinical Observations:</h3>
                      <p className="text-gray-700">{reportData.observations}</p>
                    </div>
                  )}
                  {reportData.recommendations && (
                    <div>
                      <h3 className="font-medium">Recommendations:</h3>
                      <p className="text-gray-700">{reportData.recommendations}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signature Area */}
          <div className="flex justify-end mt-8">
            <div className="text-center">
              <div className="w-48 border-t border-gray-400 mb-2"></div>
              <p className="text-sm">Doctor's Signature</p>
            </div>
          </div>

          {/* Custom Footer */}
          <div className="custom-footer">
            <div className="footer-contact">
              <strong>Contact :</strong> 0306-0200076
            </div>
            <div className="footer-address">
              <strong>Address :</strong> 194 near Naeem Safdar Dhera, Munir Shaheed<br />
              Colony, Shahbaz Khan Road Kasur
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPDFGenerator;

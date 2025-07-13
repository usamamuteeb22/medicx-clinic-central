
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope } from 'lucide-react';

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

interface ReportVitalsProps {
  formData: ReportData;
  onFormDataChange: (data: ReportData) => void;
}

const ReportVitals: React.FC<ReportVitalsProps> = ({ formData, onFormDataChange }) => {
  // Format values for print display
  const formatVital = (value: string, unit: string) => {
    return value ? `${value}${unit}` : '';
  };

  const formatWBC = (value: string) => {
    return value ? `${value}/µL` : '';
  };

  const formatPlatelets = (value: string) => {
    return value ? `${value}/µL` : '';
  };

  const formatBloodPressure = (value: string) => {
    return value ? `${value} mmHg` : '';
  };

  return (
    <>
      <Card className="medical-vitals-section">
        <CardHeader className="print-hide">
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Medical Vitals</span>
          </CardTitle>
        </CardHeader>
        
        {/* Print-only header */}
        <div className="hidden print:block">
          <h3>Medical Vitals</h3>
        </div>

        <CardContent className="space-y-4 print:p-0">
          <div className="vitals-grid">
            <div className="vital-item">
              <span className="vital-label">Hemoglobin:</span>
              <span className="vital-value">{formatVital(formData.hemoglobin, ' g/dL')}</span>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 12.5"
                value={formData.hemoglobin}
                onChange={(e) => onFormDataChange({...formData, hemoglobin: e.target.value})}
                className="print:hidden"
              />
            </div>
            <div className="vital-item">
              <span className="vital-label">WBC:</span>
              <span className="vital-value">{formatWBC(formData.wbc)}</span>
              <Input
                type="number"
                placeholder="e.g., 7000"
                value={formData.wbc}
                onChange={(e) => onFormDataChange({...formData, wbc: e.target.value})}
                className="print:hidden"
              />
            </div>
            <div className="vital-item">
              <span className="vital-label">Platelets:</span>
              <span className="vital-value">{formatPlatelets(formData.platelets)}</span>
              <Input
                type="number"
                placeholder="e.g., 250000"
                value={formData.platelets}
                onChange={(e) => onFormDataChange({...formData, platelets: e.target.value})}
                className="print:hidden"
              />
            </div>
            <div className="vital-item">
              <span className="vital-label">Blood Pressure:</span>
              <span className="vital-value">{formatBloodPressure(formData.blood_pressure)}</span>
              <Input
                placeholder="e.g., 120/80"
                value={formData.blood_pressure}
                onChange={(e) => onFormDataChange({...formData, blood_pressure: e.target.value})}
                className="print:hidden"
              />
            </div>
            <div className="vital-item">
              <span className="vital-label">Temperature:</span>
              <span className="vital-value">{formatVital(formData.temperature, '°F')}</span>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 98.6"
                value={formData.temperature}
                onChange={(e) => onFormDataChange({...formData, temperature: e.target.value})}
                className="print:hidden"
              />
            </div>
            <div className="vital-item">
              <span className="vital-label">Weight:</span>
              <span className="vital-value">{formatVital(formData.weight, ' kg')}</span>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 70.5"
                value={formData.weight}
                onChange={(e) => onFormDataChange({...formData, weight: e.target.value})}
                className="print:hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Details Section - only show if there's content */}
      {formData.clinical_complaint && (
        <>
          <Card className="clinical-complaint-section print:hidden">
            <CardHeader className="print-hide">
              <CardTitle>Clinical Details</CardTitle>
            </CardHeader>
            <CardContent className="print:p-0">
              <Textarea
                placeholder="Describe the patient's complaints and symptoms..."
                value={formData.clinical_complaint}
                onChange={(e) => onFormDataChange({...formData, clinical_complaint: e.target.value})}
                rows={3}
                className="clinical-complaint-text"
              />
            </CardContent>
          </Card>

          {/* Print-only Clinical Details */}
          <div className="clinical-complaint-section hidden print:block">
            <h3>Clinical Details</h3>
            <div className="clinical-complaint-text">{formData.clinical_complaint}</div>
          </div>
        </>
      )}
    </>
  );
};

export default ReportVitals;

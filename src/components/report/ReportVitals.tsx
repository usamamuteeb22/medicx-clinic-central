
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
              <Label htmlFor="hemoglobin" className="vital-label">Hemoglobin (HB)</Label>
              <Input
                id="hemoglobin"
                type="number"
                step="0.1"
                placeholder="e.g., 12.5"
                value={formData.hemoglobin}
                onChange={(e) => onFormDataChange({...formData, hemoglobin: e.target.value})}
                className="vital-value"
              />
            </div>
            <div className="vital-item">
              <Label htmlFor="wbc" className="vital-label">WBC Count</Label>
              <Input
                id="wbc"
                type="number"
                placeholder="e.g., 7000"
                value={formData.wbc}
                onChange={(e) => onFormDataChange({...formData, wbc: e.target.value})}
                className="vital-value"
              />
            </div>
            <div className="vital-item">
              <Label htmlFor="platelets" className="vital-label">Platelets</Label>
              <Input
                id="platelets"
                type="number"
                placeholder="e.g., 250000"
                value={formData.platelets}
                onChange={(e) => onFormDataChange({...formData, platelets: e.target.value})}
                className="vital-value"
              />
            </div>
            <div className="vital-item">
              <Label htmlFor="blood_pressure" className="vital-label">Blood Pressure</Label>
              <Input
                id="blood_pressure"
                placeholder="e.g., 120/80"
                value={formData.blood_pressure}
                onChange={(e) => onFormDataChange({...formData, blood_pressure: e.target.value})}
                className="vital-value"
              />
            </div>
            <div className="vital-item">
              <Label htmlFor="temperature" className="vital-label">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="e.g., 98.6"
                value={formData.temperature}
                onChange={(e) => onFormDataChange({...formData, temperature: e.target.value})}
                className="vital-value"
              />
            </div>
            <div className="vital-item">
              <Label htmlFor="weight" className="vital-label">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 70.5"
                value={formData.weight}
                onChange={(e) => onFormDataChange({...formData, weight: e.target.value})}
                className="vital-value"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Separate Clinical Complaint Section */}
      <Card className="clinical-complaint-section print:hidden">
        <CardHeader className="print-hide">
          <CardTitle>Clinical Complaint</CardTitle>
        </CardHeader>
        <CardContent className="print:p-0">
          <div className="clinical-complaint">
            <Label htmlFor="clinical_complaint" className="clinical-complaint-label print:block hidden">Clinical Complaint</Label>
            <Textarea
              id="clinical_complaint"
              placeholder="Describe the patient's complaints and symptoms..."
              value={formData.clinical_complaint}
              onChange={(e) => onFormDataChange({...formData, clinical_complaint: e.target.value})}
              rows={3}
              className="clinical-complaint-text"
            />
          </div>
        </CardContent>
      </Card>

      {/* Print-only Clinical Complaint */}
      <div className="clinical-complaint-section hidden print:block">
        <div className="clinical-complaint-label">Clinical Complaint</div>
        <div className="clinical-complaint-text">{formData.clinical_complaint}</div>
      </div>
    </>
  );
};

export default ReportVitals;

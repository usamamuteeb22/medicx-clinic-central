
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope } from 'lucide-react';

interface ReportVitalsProps {
  formData: {
    hemoglobin: string;
    wbc: string;
    platelets: string;
    blood_pressure: string;
    temperature: string;
    weight: string;
    clinical_complaint: string;
  };
  onFormDataChange: (data: any) => void;
}

const ReportVitals: React.FC<ReportVitalsProps> = ({ formData, onFormDataChange }) => {
  const updateField = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Stethoscope className="h-5 w-5" />
          <span>Medical Vitals & Clinical Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hemoglobin">Hemoglobin (HB)</Label>
            <Input
              id="hemoglobin"
              type="number"
              step="0.1"
              placeholder="e.g., 12.5"
              value={formData.hemoglobin}
              onChange={(e) => updateField('hemoglobin', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wbc">WBC Count</Label>
            <Input
              id="wbc"
              type="number"
              placeholder="e.g., 7000"
              value={formData.wbc}
              onChange={(e) => updateField('wbc', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platelets">Platelets</Label>
            <Input
              id="platelets"
              type="number"
              placeholder="e.g., 250000"
              value={formData.platelets}
              onChange={(e) => updateField('platelets', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="blood_pressure">Blood Pressure</Label>
            <Input
              id="blood_pressure"
              placeholder="e.g., 120/80"
              value={formData.blood_pressure}
              onChange={(e) => updateField('blood_pressure', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°F)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="e.g., 98.6"
              value={formData.temperature}
              onChange={(e) => updateField('temperature', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="e.g., 70.5"
              value={formData.weight}
              onChange={(e) => updateField('weight', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinical_complaint">Clinical Complaint</Label>
          <Textarea
            id="clinical_complaint"
            placeholder="Describe the patient's complaints and symptoms..."
            value={formData.clinical_complaint}
            onChange={(e) => updateField('clinical_complaint', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportVitals;

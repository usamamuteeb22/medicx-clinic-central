
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    medical_history: string;
    observations: string;
    recommendations: string;
  };
  onFormDataChange: (formData: any) => void;
}

const ReportVitals: React.FC<ReportVitalsProps> = ({ formData, onFormDataChange }) => {
  const handleChange = (field: string, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Stethoscope className="h-5 w-5" />
          <span>Medical Vitals & Clinical Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="hemoglobin" className="text-sm font-medium text-gray-700">
              Hemoglobin (HB)
            </Label>
            <Input
              id="hemoglobin"
              type="number"
              step="0.1"
              placeholder="e.g., 12.5"
              value={formData.hemoglobin}
              onChange={(e) => handleChange('hemoglobin', e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wbc" className="text-sm font-medium text-gray-700">
              WBC Count
            </Label>
            <Input
              id="wbc"
              type="number"
              placeholder="e.g., 7000"
              value={formData.wbc}
              onChange={(e) => handleChange('wbc', e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platelets" className="text-sm font-medium text-gray-700">
              Platelets
            </Label>
            <Input
              id="platelets"
              type="number"
              placeholder="e.g., 250000"
              value={formData.platelets}
              onChange={(e) => handleChange('platelets', e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="blood_pressure" className="text-sm font-medium text-gray-700">
              Blood Pressure
            </Label>
            <Input
              id="blood_pressure"
              placeholder="e.g., 120/80"
              value={formData.blood_pressure}
              onChange={(e) => handleChange('blood_pressure', e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-sm font-medium text-gray-700">
              Temperature (°F)
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="e.g., 98.6"
              value={formData.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="e.g., 70.5"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinical_complaint" className="text-sm font-medium text-gray-700">
            Clinical Complaint
          </Label>
          <textarea
            id="clinical_complaint"
            placeholder="Describe the patient's complaints and symptoms..."
            value={formData.clinical_complaint}
            onChange={(e) => handleChange('clinical_complaint', e.target.value)}
            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportVitals;

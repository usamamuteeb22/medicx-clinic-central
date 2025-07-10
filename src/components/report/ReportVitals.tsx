
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <CardContent className="space-y-4">
        {/* Medical Vitals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="hemoglobin" className="text-xs font-medium">
              Hemoglobin (HB)
            </Label>
            <input
              id="hemoglobin"
              type="number"
              step="0.1"
              placeholder="e.g., 12.5"
              value={formData.hemoglobin}
              onChange={(e) => handleChange('hemoglobin', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="wbc" className="text-xs font-medium">
              WBC Count
            </Label>
            <input
              id="wbc"
              type="number"
              placeholder="e.g., 7000"
              value={formData.wbc}
              onChange={(e) => handleChange('wbc', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="platelets" className="text-xs font-medium">
              Platelets
            </Label>
            <input
              id="platelets"
              type="number"
              placeholder="e.g., 250000"
              value={formData.platelets}
              onChange={(e) => handleChange('platelets', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="blood_pressure" className="text-xs font-medium">
              Blood Pressure
            </Label>
            <input
              id="blood_pressure"
              placeholder="e.g., 120/80"
              value={formData.blood_pressure}
              onChange={(e) => handleChange('blood_pressure', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="temperature" className="text-xs font-medium">
              Temperature (°F)
            </Label>
            <input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="e.g., 98.6"
              value={formData.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="weight" className="text-xs font-medium">
              Weight (kg)
            </Label>
            <input
              id="weight"
              type="number"
              step="0.1"
              placeholder="e.g., 70.5"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clinical Details Section - Compact layout (~27mm height, 2-3 lines) */}
        <div className="space-y-1">
          <Label htmlFor="clinical_complaint" className="text-xs font-medium">
            Clinical Details
          </Label>
          <textarea
            id="clinical_complaint"
            placeholder="Describe the patient's complaints and symptoms..."
            value={formData.clinical_complaint}
            onChange={(e) => handleChange('clinical_complaint', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            style={{ maxHeight: '27mm', minHeight: '27mm' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportVitals;

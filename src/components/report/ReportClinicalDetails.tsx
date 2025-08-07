
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FormData {
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

interface ReportClinicalDetailsProps {
  formData: FormData;
  onFormDataChange: (formData: FormData) => void;
}

const ReportClinicalDetails: React.FC<ReportClinicalDetailsProps> = ({
  formData,
  onFormDataChange
}) => {
  const handleInputChange = (field: keyof FormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Medical Vitals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Medical Vitals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="blood_pressure">Blood Pressure</Label>
              <Input
                id="blood_pressure"
                placeholder="e.g., 120/80"
                value={formData.blood_pressure}
                onChange={(e) => handleInputChange('blood_pressure', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                placeholder="e.g., 98.6"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 70"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bsr">BSR (mg/dL)</Label>
              <Input
                id="bsr"
                type="number"
                placeholder="e.g., 120"
                value={formData.bsr}
                onChange={(e) => handleInputChange('bsr', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saturation">Saturation (%)</Label>
              <Input
                id="saturation"
                type="number"
                min="0"
                max="100"
                placeholder="e.g., 98"
                value={formData.saturation}
                onChange={(e) => handleInputChange('saturation', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Complaint Section */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter clinical complaint..."
            value={formData.clinical_complaint}
            onChange={(e) => handleInputChange('clinical_complaint', e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Medical History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Medical History</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter medical history..."
            value={formData.medical_history}
            onChange={(e) => handleInputChange('medical_history', e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Observations Section */}
      <Card>
        <CardHeader>
          <CardTitle>Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter observations..."
            value={formData.observations}
            onChange={(e) => handleInputChange('observations', e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter recommendations..."
            value={formData.recommendations}
            onChange={(e) => handleInputChange('recommendations', e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportClinicalDetails;

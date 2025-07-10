
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface ReportMedicalHistoryProps {
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

const ReportMedicalHistory: React.FC<ReportMedicalHistoryProps> = ({ formData, onFormDataChange }) => {
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
          <FileText className="h-5 w-5" />
          <span>Medical History & Notes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="medical_history" className="text-sm font-medium text-gray-700">
            Medical History
          </Label>
          <textarea
            id="medical_history"
            placeholder="Document the patient's medical history, previous treatments, allergies, etc..."
            value={formData.medical_history}
            onChange={(e) => handleChange('medical_history', e.target.value)}
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observations" className="text-sm font-medium text-gray-700">
            Clinical Observations
          </Label>
          <textarea
            id="observations"
            placeholder="Record clinical observations, examination findings, diagnostic impressions..."
            value={formData.observations}
            onChange={(e) => handleChange('observations', e.target.value)}
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recommendations" className="text-sm font-medium text-gray-700">
            Recommendations & Treatment Plan
          </Label>
          <textarea
            id="recommendations"
            placeholder="Provide treatment recommendations, follow-up instructions, lifestyle advice..."
            value={formData.recommendations}
            onChange={(e) => handleChange('recommendations', e.target.value)}
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportMedicalHistory;

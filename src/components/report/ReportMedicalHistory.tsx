
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface ReportMedicalHistoryProps {
  formData: {
    medical_history: string;
    observations: string;
    recommendations: string;
  };
  onFormDataChange: (data: any) => void;
}

const ReportMedicalHistory: React.FC<ReportMedicalHistoryProps> = ({ formData, onFormDataChange }) => {
  const updateField = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Medical History & Notes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="medical_history">Medical History</Label>
          <Textarea
            id="medical_history"
            placeholder="Previous medical conditions, surgeries, allergies..."
            value={formData.medical_history}
            onChange={(e) => updateField('medical_history', e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="observations">Clinical Observations</Label>
          <Textarea
            id="observations"
            placeholder="Doctor's observations and findings..."
            value={formData.observations}
            onChange={(e) => updateField('observations', e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recommendations">Recommendations</Label>
          <Textarea
            id="recommendations"
            placeholder="Treatment recommendations and follow-up instructions..."
            value={formData.recommendations}
            onChange={(e) => updateField('recommendations', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportMedicalHistory;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

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

interface ReportMedicalHistoryProps {
  formData: ReportData;
  onFormDataChange: (data: ReportData) => void;
}

const ReportMedicalHistory: React.FC<ReportMedicalHistoryProps> = ({
  formData,
  onFormDataChange,
}) => {
  const handleChange = (field: keyof ReportData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const hasAnyContent = [formData.medical_history, formData.observations, formData.recommendations]
    .some(val => val?.trim());

  return (
    <>
      {/* Interactive form - always visible on screen */}
      <Card className="medical-history-section print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Medical History & Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="history-item">
            <Label htmlFor="medical_history" className="history-label">
              Medical History
            </Label>
            <Textarea
              id="medical_history"
              placeholder="Previous medical conditions, surgeries, medications..."
              value={formData.medical_history}
              onChange={(e) => handleChange('medical_history', e.target.value)}
              rows={4}
              className="history-text"
            />
          </div>

          <div className="history-item">
            <Label htmlFor="observations" className="history-label">
              Doctor's Observations
            </Label>
            <Textarea
              id="observations"
              placeholder="Clinical observations and findings..."
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              rows={4}
              className="history-text"
            />
          </div>

          <div className="history-item">
            <Label htmlFor="recommendations" className="history-label">
              Recommendations
            </Label>
            <Textarea
              id="recommendations"
              placeholder="Treatment recommendations and follow-up instructions..."
              value={formData.recommendations}
              onChange={(e) => handleChange('recommendations', e.target.value)}
              rows={4}
              className="history-text"
            />
          </div>
        </CardContent>
      </Card>

      {/* Print-only version */}
      {hasAnyContent && (
        <div className="medical-history-section hidden print:block">
          <h3>Medical History & Notes</h3>
          <div className="history-grid">
            {formData.medical_history?.trim() && (
              <div className="history-item">
                <div className="history-label">Medical History</div>
                <div className="history-text">{formData.medical_history}</div>
              </div>
            )}
            {formData.observations?.trim() && (
              <div className="history-item">
                <div className="history-label">Doctor's Observations</div>
                <div className="history-text">{formData.observations}</div>
              </div>
            )}
            {formData.recommendations?.trim() && (
              <div className="history-item">
                <div className="history-label">Recommendations</div>
                <div className="history-text">{formData.recommendations}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ReportMedicalHistory;

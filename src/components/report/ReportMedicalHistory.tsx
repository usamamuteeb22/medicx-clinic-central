
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

const ReportMedicalHistory: React.FC<ReportMedicalHistoryProps> = ({ formData, onFormDataChange }) => {
  // Check if any section has content
  const hasContent = formData.medical_history || formData.observations || formData.recommendations;

  // Don't render the section at all if no content in print mode
  if (!hasContent) {
    return (
      <div className="print:hidden">
        <Card className="medical-history-section">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Medical History & Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="history-item">
              <Label htmlFor="medical_history" className="history-label">Medical History</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => onFormDataChange({...formData, medical_history: e.target.value})}
                rows={4}
                className="history-text"
              />
            </div>
            <div className="history-item">
              <Label htmlFor="observations" className="history-label">Doctor's Observations</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => onFormDataChange({...formData, observations: e.target.value})}
                rows={4}
                className="history-text"
              />
            </div>
            <div className="history-item">
              <Label htmlFor="recommendations" className="history-label">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={formData.recommendations}
                onChange={(e) => onFormDataChange({...formData, recommendations: e.target.value})}
                rows={4}
                className="history-text"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card className="medical-history-section print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Medical History & Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="history-item">
            <Label htmlFor="medical_history" className="history-label">Medical History</Label>
            <Textarea
              id="medical_history"
              placeholder="Previous medical conditions, surgeries, medications..."
              value={formData.medical_history}
              onChange={(e) => onFormDataChange({...formData, medical_history: e.target.value})}
              rows={4}
              className="history-text"
            />
          </div>
          <div className="history-item">
            <Label htmlFor="observations" className="history-label">Doctor's Observations</Label>
            <Textarea
              id="observations"
              placeholder="Clinical observations and findings..."
              value={formData.observations}
              onChange={(e) => onFormDataChange({...formData, observations: e.target.value})}
              rows={4}
              className="history-text"
            />
          </div>
          <div className="history-item">
            <Label htmlFor="recommendations" className="history-label">Recommendations</Label>
            <Textarea
              id="recommendations"
              placeholder="Treatment recommendations and follow-up instructions..."
              value={formData.recommendations}
              onChange={(e) => onFormDataChange({...formData, recommendations: e.target.value})}
              rows={4}
              className="history-text"
            />
          </div>
        </CardContent>
      </Card>

      {/* Print-only version - only show sections with content and hide empty headings */}
      <div className="medical-history-section hidden print:block">
        <h3>Medical History & Notes</h3>
        <div className="history-grid">
          {formData.medical_history && (
            <div className="history-item">
              <div className="history-label">Medical History</div>
              <div className="history-text">{formData.medical_history}</div>
            </div>
          )}
          {formData.observations && (
            <div className="history-item">
              <div className="history-label">Doctor's Observations</div>
              <div className="history-text">{formData.observations}</div>
            </div>
          )}
          {formData.recommendations && (
            <div className="history-item">
              <div className="history-label">Recommendations</div>
              <div className="history-text">{formData.recommendations}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportMedicalHistory;

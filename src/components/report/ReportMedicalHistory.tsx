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
  const { medical_history, observations, recommendations } = formData;
  const hasAnyContent = medical_history || observations || recommendations;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <>
      {/* Editable screen version */}
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
              value={medical_history}
              onChange={(e) =>
                onFormDataChange({ ...formData, medical_history: e.target.value })
              }
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
              value={observations}
              onChange={(e) =>
                onFormDataChange({ ...formData, observations: e.target.value })
              }
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
              value={recommendations}
              onChange={(e) =>
                onFormDataChange({ ...formData, recommendations: e.target.value })
              }
              rows={4}
              className="history-text"
            />
          </div>
        </CardContent>
      </Card>

      {/* Print-only version - show *only* non-empty fields */}
      <div className="medical-history-section hidden print:block">
        <h3>Medical History & Notes</h3>
        <div className="history-grid space-y-4">
          {medical_history && (
            <div className="history-item">
              <div className="history-label">Medical History</div>
              <div className="history-text">{medical_history}</div>
            </div>
          )}
          {observations && (
            <div className="history-item">
              <div className="history-label">Doctor's Observations</div>
              <div className="history-text">{observations}</div>
            </div>
          )}
          {recommendations && (
            <div className="history-item">
              <div className="history-label">Recommendations</div>
              <div className="history-text">{recommendations}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportMedicalHistory;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { FormData } from '@/types/reportTypes';

interface ReportMedicalHistoryProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const ReportMedicalHistory: React.FC<ReportMedicalHistoryProps> = ({
  formData,
  onFormDataChange,
}) => {
  const { medical_history, observations, recommendations } = formData;
  const hasAnyContent = medical_history || observations || recommendations;

  // Don't render if no content
  if (!hasAnyContent) {
    return null;
  }

  return (
    <>
      {/* Screen version */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Medical History & Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {medical_history && (
            <div>
              <Label htmlFor="medical_history">Medical History</Label>
              <Textarea
                id="medical_history"
                value={medical_history}
                onChange={(e) =>
                  onFormDataChange({ ...formData, medical_history: e.target.value })
                }
                rows={3}
              />
            </div>
          )}
          {observations && (
            <div>
              <Label htmlFor="observations">Doctor's Observations</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) =>
                  onFormDataChange({ ...formData, observations: e.target.value })
                }
                rows={3}
              />
            </div>
          )}
          {recommendations && (
            <div>
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={recommendations}
                onChange={(e) =>
                  onFormDataChange({ ...formData, recommendations: e.target.value })
                }
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print version - only show sections with content */}
      <div className="hidden print:block medical-history-print">
        <h3>Medical History & Notes</h3>
        <div className="space-y-3">
          {medical_history && (
            <div>
              <div className="font-bold text-sm">Medical History:</div>
              <div className="text-sm">{medical_history}</div>
            </div>
          )}
          {observations && (
            <div>
              <div className="font-bold text-sm">Doctor's Observations:</div>
              <div className="text-sm">{observations}</div>
            </div>
          )}
          {recommendations && (
            <div>
              <div className="font-bold text-sm">Recommendations:</div>
              <div className="text-sm">{recommendations}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportMedicalHistory;

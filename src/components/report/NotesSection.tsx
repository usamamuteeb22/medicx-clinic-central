
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { FormData } from '@/types/reportTypes';

interface NotesSectionProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  formData,
  onFormDataChange,
}) => {
  return (
    <>
      {/* Screen version */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Notes Section</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="medicine_notes">Medicine Notes</Label>
            <Textarea
              id="medicine_notes"
              value={formData.medicine_notes}
              onChange={(e) =>
                onFormDataChange({ ...formData, medicine_notes: e.target.value })
              }
              placeholder="Additional notes about prescribed medicines..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="test_advice">Test Advice</Label>
            <Textarea
              id="test_advice"
              value={formData.test_advice}
              onChange={(e) =>
                onFormDataChange({ ...formData, test_advice: e.target.value })
              }
              placeholder="Recommended tests and medical advice..."
              rows={3}
            />
          </div>
          <div>
            <Label>Notes (For handwriting after print)</Label>
            <div className="min-h-[120px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4">
              <p className="text-gray-500 text-sm">This section will be blank on print for handwritten notes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print version */}
      <div className="hidden print:block notes-print-section">
        {(formData.medicine_notes || formData.test_advice) && (
          <>
            <h3>Notes</h3>
            <div className="space-y-3">
              {formData.medicine_notes && (
                <div>
                  <div className="font-bold text-sm">Medicine Notes:</div>
                  <div className="text-sm">{formData.medicine_notes}</div>
                </div>
              )}
              {formData.test_advice && (
                <div>
                  <div className="font-bold text-sm">Test Advice:</div>
                  <div className="text-sm">{formData.test_advice}</div>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Handwritten Notes Box - always show on print */}
        <div className="handwritten-notes-box">
          <div className="font-bold text-sm mb-2">Notes:</div>
          <div className="notes-blank-area"></div>
        </div>
      </div>
    </>
  );
};

export default NotesSection;

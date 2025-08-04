
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { FormData } from '@/types/reportTypes';

interface PatientHistorySectionProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const PatientHistorySection: React.FC<PatientHistorySectionProps> = ({
  formData,
  onFormDataChange,
}) => {
  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Patient History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="patient_history">Patient History</Label>
          <Textarea
            id="patient_history"
            value={formData.patient_history}
            onChange={(e) =>
              onFormDataChange({ ...formData, patient_history: e.target.value })
            }
            placeholder="Record patient's medical history, previous treatments, allergies, etc. This will only appear in the report preview, not in the printed report."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientHistorySection;

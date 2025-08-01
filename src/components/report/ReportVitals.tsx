
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope } from 'lucide-react';

interface FormData {
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

interface ReportVitalsProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

// Helper: allow only valid numbers (1 decimal point)
const sanitizeDecimalInput = (value: string) => {
  return value
    .replace(/[^\d.]/g, '')      // remove non-digits/non-dot
    .replace(/(\..*?)\./g, '$1') // only one dot
    .replace(/^0+(\d)/, '$1');   // remove leading zeros
};

// Helper: allow only integers
const sanitizeIntegerInput = (value: string) => {
  return value.replace(/\D/g, '');
};

const ReportVitals: React.FC<ReportVitalsProps> = ({ formData, onFormDataChange }) => {
  // Format for print
  const formatVital = (value: string, unit: string) => value ? `${value} ${unit}` : '';

  return (
    <>
      <Card className="medical-vitals-section">
        <CardHeader className="print-hide">
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Medical Vitals</span>
          </CardTitle>
        </CardHeader>

        <div className="hidden print:block">
          <h3>Medical Vitals</h3>
        </div>

        <CardContent className="space-y-4 print:p-0">
          <div className="vitals-grid">

            {/* Hemoglobin */}
            <div className="vital-item">
              <span className="vital-label">Hemoglobin:</span>
              <span className="vital-value hidden print:inline">
                {formatVital(formData.hemoglobin, 'g/dL')}
              </span>
              <Input
                type="text"
                value={formData.hemoglobin}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    hemoglobin: sanitizeDecimalInput(e.target.value),
                  })
                }
                className="print:hidden"
              />
            </div>

            {/* WBC */}
            <div className="vital-item">
              <span className="vital-label">WBC:</span>
              <span className="vital-value hidden print:inline">
                {formatVital(formData.wbc, '/µL')}
              </span>
              <Input
                type="text"
                value={formData.wbc}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    wbc: sanitizeIntegerInput(e.target.value),
                  })
                }
                className="print:hidden"
              />
            </div>

            {/* Platelets */}
            <div className="vital-item">
              <span className="vital-label">Platelets:</span>
              <span className="vital-value hidden print:inline">
                {formatVital(formData.platelets, '/µL')}
              </span>
              <Input
                type="text"
                value={formData.platelets}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    platelets: sanitizeIntegerInput(e.target.value),
                  })
                }
                className="print:hidden"
              />
            </div>

            {/* Blood Pressure */}
            <div className="vital-item">
              <span className="vital-label">Blood Pressure:</span>
              <span className="vital-value hidden print:inline">
                {formatVital(formData.blood_pressure, 'mmHg')}
              </span>
              <Input
                type="text"
                value={formData.blood_pressure}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    blood_pressure: sanitizeIntegerInput(e.target.value),
                  })
                }
                className="print:hidden"
              />
            </div>

            {/* Temperature */}
            <div className="vital-item">
              <span className="vital-label">Temperature:</span>
              <span className="vital-value hidden print:inline">
                {formatVital(formData.temperature, '°F')}
              </span>
              <Input
                type="text"
                value={formData.temperature}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    temperature: sanitizeDecimalInput(e.target.value),
                  })
                }
                className="print:hidden"
              />
            </div>

            {/* Weight */}
            <div className="vital-item">
              <span className="vital-label">Weight:</span>
              <span className="vital-value hidden print:inline">
                {formatVital(formData.weight, 'kg')}
              </span>
              <Input
                type="text"
                value={formData.weight}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    weight: sanitizeDecimalInput(e.target.value),
                  })
                }
                className="print:hidden"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Clinical Complaint Section */}
      {formData.clinical_complaint && (
        <>
          <Card className="clinical-complaint-section print:hidden">
            <CardHeader className="print-hide">
              <CardTitle>Clinical Details</CardTitle>
            </CardHeader>
            <CardContent className="print:p-0">
              <Textarea
                placeholder="Describe the patient's complaints and symptoms..."
                value={formData.clinical_complaint}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    clinical_complaint: e.target.value,
                  })
                }
                rows={3}
                className="clinical-complaint-text"
              />
            </CardContent>
          </Card>

          <div className="clinical-complaint-section hidden print:block">
            <h3>Clinical Details</h3>
            <div className="clinical-complaint-text">
              {formData.clinical_complaint}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ReportVitals;

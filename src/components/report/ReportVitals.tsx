import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormData } from '@/types/reportTypes';

interface ReportVitalsProps {
  formData: FormData;
  onFormDataChange: (formData: FormData) => void;
}

const ReportVitals: React.FC<ReportVitalsProps> = ({ formData, onFormDataChange }) => {
  const handleInputChange = (field: keyof FormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Medical Vitals Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
            <span>Medical Vitals</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="medical-vitals-section">
            <div className="vitals-grid">
              {/* Blood Pressure */}
              <div className="vital-item">
                <Label htmlFor="blood_pressure" className="vital-label">Blood Pressure:</Label>
                <Input
                  id="blood_pressure"
                  type="text"
                  value={formData.blood_pressure}
                  onChange={(e) => handleInputChange('blood_pressure', e.target.value)}
                  placeholder="e.g. 120/80"
                  className="vital-value screen-only"
                />
                <span className="print-only vital-text">
                  {formData.blood_pressure ? `${formData.blood_pressure} mmHg` : ""}
                </span>
              </div>

              {/* Temperature */}
              <div className="vital-item">
                <Label htmlFor="temperature" className="vital-label">Temperature:</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  placeholder="°F"
                  className="vital-value screen-only"
                />
                <span className="print-only vital-text">
                  {formData.temperature ? `${formData.temperature} °F` : ""}
                </span>
              </div>

              {/* Weight */}
              <div className="vital-item">
                <Label htmlFor="weight" className="vital-label">Weight:</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="kg"
                  className="vital-value screen-only"
                />
                <span className="print-only vital-text">
                  {formData.weight ? `${formData.weight} kg` : ""}
                </span>
              </div>

              {/* BSR */}
              <div className="vital-item">
                <Label htmlFor="bsr" className="vital-label">BSR:</Label>
                <Input
                  id="bsr"
                  type="number"
                  value={formData.bsr}
                  onChange={(e) => handleInputChange('bsr', e.target.value)}
                  placeholder="mg/dL"
                  className="vital-value screen-only"
                />
                <span className="print-only vital-text">
                  {formData.bsr ? `${formData.bsr} mg/dL` : ""}
                </span>
              </div>

              {/* Saturation */}
              <div className="vital-item">
                <Label htmlFor="saturation" className="vital-label">Saturation:</Label>
                <Input
                  id="saturation"
                  type="number"
                  value={formData.saturation}
                  onChange={(e) => handleInputChange('saturation', e.target.value)}
                  placeholder="%"
                  className="vital-value screen-only"
                />
                <span className="print-only vital-text">
                  {formData.saturation ? `${formData.saturation}%` : ""}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles for Medical Reports */}
      <style>{`
        @media print {
          .medical-vitals-section {
            width: calc(100% + 20px);
            margin-left: -10px;
            margin-right: -10px;
            page-break-inside: avoid;
            border: 1pt solid #000;
            padding: 4mm;
          }

          .vitals-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3mm;
            width: 100%;
          }

          .vital-item {
            display: flex;
            align-items: center;
            font-size: 11pt;
            min-height: 5mm;
          }

          .vital-label {
            font-weight: bold;
            margin-right: 2mm;
            color: #000;
            white-space: nowrap;
            min-width: 35mm;
          }

          .screen-only {
            display: none !important;
          }

          .print-only {
            display: inline !important;
            color: #000;
          }
        }

        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportVitals;

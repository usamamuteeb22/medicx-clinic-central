
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
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="medical-vitals-section">
            <h3>Medical Vitals</h3>
            <div className="vitals-grid">
              <div className="vital-item" data-vital="blood_pressure">
                <Label htmlFor="blood_pressure" className="vital-label">Blood Pressure:</Label>
                <Input
                  id="blood_pressure"
                  type="text"
                  value={formData.blood_pressure}
                  onChange={(e) => handleInputChange('blood_pressure', e.target.value)}
                  placeholder="e.g. 120/80"
                  className="vital-value"
                />
              </div>
              
              <div className="vital-item" data-vital="temperature">
                <Label htmlFor="temperature" className="vital-label">Temperature:</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  placeholder="°F"
                  className="vital-value"
                />
              </div>
              
              <div className="vital-item" data-vital="weight">
                <Label htmlFor="weight" className="vital-label">Weight:</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight} 
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="kg"
                  className="vital-value"
                />
              </div>
              
              <div className="vital-item" data-vital="bsr">
                <Label htmlFor="bsr" className="vital-label">BSR:</Label>
                <Input
                  id="bsr"
                  type="number"
                  value={formData.bsr}
                  onChange={(e) => handleInputChange('bsr', e.target.value)}
                  placeholder="mg/dL"
                  className="vital-value"
                />
              </div>
              
              <div className="vital-item" data-vital="saturation">
                <Label htmlFor="saturation" className="vital-label">Saturation:</Label>
                <Input
                  id="saturation"
                  type="number"
                  value={formData.saturation}
                  onChange={(e) => handleInputChange('saturation', e.target.value)}
                  placeholder="%"
                  className="vital-value"
                />
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
            margin-top: 0mm;
            margin-bottom: 0mm;
            page-break-inside: avoid;
            border: 1pt solid #000;
            padding: 1mm 4mm;
          }
          
          .medical-vitals-section h3 {
            font-size: 14pt;
            font-weight: bold;
            margin: 0 0 2mm 0;
            color: #000;
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
            font-size: 10pt;
            min-height: 3mm;
          }
          
          .vital-item input {
            border: none !important;
            background: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .vital-label {
            font-weight: bold;
            margin-right: 2mm;
            color: #000;
            white-space: nowrap;
            min-width: 30mm;
          }
          
          .vital-value {
            color: #000;
            word-wrap: break-word;
          }
          
          /* Add units after vital values in print */
          .vital-item[data-vital="blood_pressure"] .vital-value::after {
            content: " mmHg";
          }
          
          .vital-item[data-vital="temperature"] .vital-value::after {
            content: "°F";
          }
          
          .vital-item[data-vital="weight"] .vital-value::after {
            content: " kg";
          }
          
          .vital-item[data-vital="bsr"] .vital-value::after {
            content: " mg/dL";
          }
          
          .vital-item[data-vital="saturation"] .vital-value::after {
            content: "%";
          }
        }
      `}</style>
    </div>
  );
};

export default ReportVitals;

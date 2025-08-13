
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormData {
  blood_pressure: string;
  temperature: string;
  weight: string;
  bsr: string;
  saturation: string;
  clinical_complaint: string;
  medical_history: string;
  observations: string;
  recommendations: string;
  patient_history: string;
}

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
            <h3>Medical Vitals</h3>
            <div className="vitals-grid">
              <div className="vital-item">
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
              
              <div className="vital-item">
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
              
              <div className="vital-item">
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
              
              <div className="vital-item">
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
              
              <div className="vital-item">
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

      {/* Clinical Complaint Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <div className="w-2 h-6 bg-slate-500 rounded-full"></div>
            <span>Clinical Complaint</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="clinical-complaint-section">
            <h3>Clinical Complaint</h3>
            <div>
              <Label htmlFor="clinical_complaint">Clinical Complaint</Label>
              <Textarea
                id="clinical_complaint"
                value={formData.clinical_complaint}
                onChange={(e) => handleInputChange('clinical_complaint', e.target.value)}
                placeholder="Describe the patient's main complaint or symptoms"
                rows={4}
                className="clinical-complaint-text"
              />
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
          
          .clinical-complaint-section {
            width: calc(100% + 20px);
            margin-left: -10px;
            margin-right: -10px;
            margin-bottom: 3mm;
            page-break-inside: avoid;
            border: 1pt solid #000;
            padding: 4mm;
            display:none;
          }
          
          .clinical-complaint-section h3 {
            font-size: 14pt;
            font-weight: bold;
            margin: 0 0 4mm 0;
            color: #000;
          }
          
          .clinical-complaint-section textarea {
            border: none !important;
            background: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            resize: none !important;
            padding: 0 !important;
            margin: 0 !important;
            font-size: 10pt;
            color: #000;
            line-height: 1.3;
            word-wrap: break-word;
            width: 100% !important;
          }
          
          .clinical-complaint-text {
            font-size: 10pt;
            color: #000;
            line-height: 1.3;
            word-wrap: break-word;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportVitals;

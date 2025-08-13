
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

const ReportVitals: React.FC<ReportVitalsProps> = ({ formData }) => {
  return (
    <div className="space-y-6">
      {/* Medical Vitals Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Medical Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Blood Pressure</div>
              <div className="text-lg font-semibold text-gray-900">
                {formData.blood_pressure || 'N/A'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Temperature</div>
              <div className="text-lg font-semibold text-gray-900">
                {formData.temperature ? `${formData.temperature}°F` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Weight</div>
              <div className="text-lg font-semibold text-gray-900">
                {formData.weight ? `${formData.weight} kg` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">BSR</div>
              <div className="text-lg font-semibold text-gray-900">
                {formData.bsr ? `${formData.bsr} mg/dL` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">Saturation</div>
              <div className="text-lg font-semibold text-gray-900">
                {formData.saturation ? `${formData.saturation}%` : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Complaint Card */}
      {formData.clinical_complaint && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Clinical Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 leading-relaxed">
                {formData.clinical_complaint}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print Styles for Medical Reports */}
      <style jsx>{`
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
          }
          
          .clinical-complaint-section h3 {
            font-size: 14pt;
            font-weight: bold;
            margin: 0 0 4mm 0;
            color: #000;
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

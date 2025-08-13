
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
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
            <span>Medical Vitals</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-red-700 uppercase tracking-wide">Blood Pressure</div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-red-800">
                {formData.blood_pressure || 'N/A'}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Temperature</div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-orange-800">
                {formData.temperature ? `${formData.temperature}°F` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-green-700 uppercase tracking-wide">Weight</div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-green-800">
                {formData.weight ? `${formData.weight} kg` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-purple-700 uppercase tracking-wide">BSR</div>
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-purple-800">
                {formData.bsr ? `${formData.bsr} mg/dL` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Saturation</div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {formData.saturation ? `${formData.saturation}%` : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Complaint Card */}
      {formData.clinical_complaint && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <div className="w-2 h-6 bg-slate-500 rounded-full"></div>
              <span>Clinical Complaint</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
              <p className="text-gray-800 leading-relaxed text-lg">
                {formData.clinical_complaint}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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

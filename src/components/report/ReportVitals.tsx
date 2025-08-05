
import React from 'react';

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
    <>
      <div className="medical-vitals-section">
        <h3>Medical Vitals</h3>
        <div className="vitals-grid">
          <div className="vital-item">
            <span className="vital-label">Blood Pressure:</span>
            <span className="vital-value">{formData.blood_pressure || 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Temperature:</span>
            <span className="vital-value">{formData.temperature ? `${formData.temperature}°F` : 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Weight:</span>
            <span className="vital-value">{formData.weight ? `${formData.weight} kg` : 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">BSR:</span>
            <span className="vital-value">{formData.bsr ? `${formData.bsr} mg/dL` : 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Saturation:</span>
            <span className="vital-value">{formData.saturation ? `${formData.saturation}%` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {formData.clinical_complaint && (
        <div className="clinical-complaint-section">
          <h3>Clinical Complaint</h3>
          <div className="clinical-complaint-text">{formData.clinical_complaint}</div>
        </div>
      )}
    </>
  );
};

export default ReportVitals;

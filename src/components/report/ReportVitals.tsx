
import React from 'react';

interface ReportData {
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
  reportData: ReportData;
}

const ReportVitals: React.FC<ReportVitalsProps> = ({ reportData }) => {
  return (
    <div className="section vitals-section">
      <div className="section-title">Medical Vitals</div>
      <div className="vitals-grid">
        <div className="vitals-row">
          {reportData.hemoglobin && (
            <div className="vital-item">
              <strong>Hemoglobin:</strong>
              <span>{reportData.hemoglobin} g/dL</span>
            </div>
          )}
          {reportData.wbc && (
            <div className="vital-item">
              <strong>WBC:</strong>
              <span>{reportData.wbc}</span>
            </div>
          )}
        </div>
        <div className="vitals-row">
          {reportData.platelets && (
            <div className="vital-item">
              <strong>Platelets:</strong>
              <span>{reportData.platelets}</span>
            </div>
          )}
          {reportData.blood_pressure && (
            <div className="vital-item">
              <strong>Blood Pressure:</strong>
              <span>{reportData.blood_pressure} mmHg</span>
            </div>
          )}
        </div>
        <div className="vitals-row">
          {reportData.temperature && (
            <div className="vital-item">
              <strong>Temperature:</strong>
              <span>{reportData.temperature}°F</span>
            </div>
          )}
          {reportData.weight && (
            <div className="vital-item">
              <strong>Weight:</strong>
              <span>{reportData.weight} kg</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportVitals;

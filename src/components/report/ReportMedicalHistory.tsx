
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

interface ReportMedicalHistoryProps {
  reportData: ReportData;
}

const ReportMedicalHistory: React.FC<ReportMedicalHistoryProps> = ({ 
  reportData 
}) => {
  return (
    <div className="section history-section">
      <div className="section-title">Medical History & Notes</div>
      {reportData.medical_history && (
        <div className="history-item">
          <h4>Medical History:</h4>
          <p>{reportData.medical_history}</p>
        </div>
      )}
      {reportData.observations && (
        <div className="history-item">
          <h4>Clinical Observations:</h4>
          <p>{reportData.observations}</p>
        </div>
      )}
      {reportData.recommendations && (
        <div className="history-item">
          <h4>Recommendations:</h4>
          <p>{reportData.recommendations}</p>
        </div>
      )}
    </div>
  );
};

export default ReportMedicalHistory;

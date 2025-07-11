
import React from 'react';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface ReportPatientInfoProps {
  patient: Patient;
}

const ReportPatientInfo: React.FC<ReportPatientInfoProps> = ({ patient }) => {
  return (
    <div className="patient-info-section avoid-break">
      <div className="patient-info-grid">
        <div className="patient-info-item">
          <span className="patient-info-label">Patient Name:</span>
          <span className="patient-info-value">{patient.name}</span>
        </div>
        <div className="patient-info-item">
          <span className="patient-info-label">Patient ID:</span>
          <span className="patient-info-value">{patient.patient_id}</span>
        </div>
        <div className="patient-info-item">
          <span className="patient-info-label">Age:</span>
          <span className="patient-info-value">{patient.age} years</span>
        </div>
        <div className="patient-info-item">
          <span className="patient-info-label">Gender:</span>
          <span className="patient-info-value">{patient.gender}</span>
        </div>
        <div className="patient-info-item">
          <span className="patient-info-label">Phone Number:</span>
          <span className="patient-info-value">{patient.phone_number || 'N/A'}</span>
        </div>
        <div className="patient-info-item">
          <span className="patient-info-label">Report Date:</span>
          <span className="patient-info-value">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ReportPatientInfo;


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
    <div className="section patient-section">
      <div className="section-title">Patient Information</div>
      <div className="patient-info-grid">
        <div className="patient-info-item">
          <strong>Patient ID:</strong>
          <span>{patient.patient_id}</span>
        </div>
        <div className="patient-info-item">
          <strong>Name:</strong>
          <span>{patient.name}</span>
        </div>
        <div className="patient-info-item">
          <strong>Age:</strong>
          <span>{patient.age} years</span>
        </div>
        <div className="patient-info-item">
          <strong>Gender:</strong>
          <span>{patient.gender}</span>
        </div>
        <div className="patient-info-item">
          <strong>Phone:</strong>
          <span>{patient.phone_number || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default ReportPatientInfo;

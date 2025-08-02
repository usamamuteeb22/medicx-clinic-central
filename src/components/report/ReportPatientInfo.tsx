
import React from 'react';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age?: number;
  age_years?: number;
  age_months?: number;
  age_days?: number;
  gender: string;
  phone_number: string;
  cnic?: string;
  category?: string;
}

interface ReportPatientInfoProps {
  patient: Patient;
}

const ReportPatientInfo: React.FC<ReportPatientInfoProps> = ({ patient }) => {
  const formatAge = () => {
    if (patient.age_years || patient.age_months || patient.age_days) {
      const parts = [];
      if (patient.age_years && patient.age_years > 0) parts.push(`${patient.age_years} years`);
      if (patient.age_months && patient.age_months > 0) parts.push(`${patient.age_months} months`);
      if (patient.age_days && patient.age_days > 0) parts.push(`${patient.age_days} days`);
      return parts.join(', ') || 'N/A';
    }
    return patient.age ? `${patient.age} years` : 'N/A';
  };

  return (
    <div className="patient-info-section">
      <h3>Patient Information</h3>
      <div className="patient-info-grid">
        <div className="patient-info-content">
          <div className="patient-info-item">
            <span className="patient-info-label">Patient ID:</span>
            <span className="patient-info-value">{patient.patient_id}</span>
          </div>
          <div className="patient-info-item">
            <span className="patient-info-label">Name:</span>
            <span className="patient-info-value">{patient.name}</span>
          </div>
          <div className="patient-info-item">
            <span className="patient-info-label">Age:</span>
            <span className="patient-info-value">{formatAge()}</span>
          </div>
          <div className="patient-info-item">
            <span className="patient-info-label">Gender:</span>
            <span className="patient-info-value">{patient.gender}</span>
          </div>
          <div className="patient-info-item">
            <span className="patient-info-label">Phone:</span>
            <span className="patient-info-value">{patient.phone_number || 'N/A'}</span>
          </div>
          <div className="patient-info-item">
            <span className="patient-info-label">CNIC:</span>
            <span className="patient-info-value">{patient.cnic || 'N/A'}</span>
          </div>
          <div className="patient-info-item">
            <span className="patient-info-label">Category:</span>
            <span className="patient-info-value">{patient.category || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPatientInfo;


import React from 'react';

interface ReportClinicalDetailsProps {
  clinicalComplaint: string;
}

const ReportClinicalDetails: React.FC<ReportClinicalDetailsProps> = ({ 
  clinicalComplaint 
}) => {
  if (!clinicalComplaint) return null;

  return (
    <div className="section clinical-section">
      <div className="section-title">Clinical Details</div>
      <div className="clinical-content">
        {clinicalComplaint}
      </div>
    </div>
  );
};

export default ReportClinicalDetails;

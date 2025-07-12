
import React from 'react';

interface ReportClinicalDetailsProps {
  clinicalComplaint: string;
}

const ReportClinicalDetails: React.FC<ReportClinicalDetailsProps> = ({ 
  clinicalComplaint 
}) => {
  // This component is now handled in ReportVitals for better layout control
  return null;
};

export default ReportClinicalDetails;

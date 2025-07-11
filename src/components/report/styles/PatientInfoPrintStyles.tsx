
import React from 'react';

const PatientInfoPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Patient info section */
        .patient-info-section {
          margin: 20px 0;
          page-break-inside: avoid;
        }

        .patient-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .patient-info-item {
          padding: 0;
          margin: 0;
        }

        .patient-info-label {
          font-weight: bold;
          font-size: 11pt;
          color: #333;
          display: block;
          margin-bottom: 2px;
        }

        .patient-info-value {
          font-size: 12pt;
          color: #000;
          border-bottom: 1px solid #ccc;
          padding: 4px 0;
          display: block;
          min-height: 18px;
        }
      }
      `
    }} />
  );
};

export default PatientInfoPrintStyles;

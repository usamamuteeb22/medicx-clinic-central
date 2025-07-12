
import React from 'react';

const PatientInfoPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Patient info section - 20mm height */
        .patient-info-section {
          width: 190mm;
          height: 20mm;
          border: 0.5mm solid #000;
          padding: 2mm;
          margin-bottom: 2mm;
          page-break-inside: avoid;
        }

        .patient-info-section h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 0 0 2mm 0;
          color: #000;
          height: 3mm;
          line-height: 3mm;
        }

        .patient-info-grid {
          display: flex;
          height: 13mm;
          align-items: center;
        }

        .patient-info-content {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 8mm;
          font-size: 10pt;
        }

        .patient-info-item {
          display: inline-flex;
          align-items: center;
          height: 5mm;
        }

        .patient-info-label {
          font-weight: bold;
          margin-right: 2mm;
        }

        .patient-info-value {
          color: #000;
        }
      }
      `
    }} />
  );
};

export default PatientInfoPrintStyles;

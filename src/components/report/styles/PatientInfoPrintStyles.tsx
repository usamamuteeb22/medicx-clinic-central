
import React from 'react';

const PatientInfoPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Patient info section - moved further down to avoid header overflow */
        .patient-info-section {
          width: 190mm;
          height: 18mm;
          border: 0.5mm solid #000;
          padding: 2mm;
          margin-top: 8mm;
          margin-bottom: 1mm;
          page-break-inside: avoid;
        }

        .patient-info-section h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 0 0 1.5mm 0;
          color: #000;
          height: 3mm;
          line-height: 3mm;
        }

        .patient-info-grid {
          display: flex;
          height: 11mm;
          align-items: center;
        }

        .patient-info-content {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 6mm;
          font-size: 10pt;
          line-height: 1.2;
        }

        .patient-info-item {
          display: inline-flex;
          align-items: center;
          height: 4mm;
        }

        .patient-info-label {
          font-weight: bold;
          margin-right: 1.5mm;
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

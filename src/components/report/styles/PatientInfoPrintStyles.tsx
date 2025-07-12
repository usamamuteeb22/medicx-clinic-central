
import React from 'react';

const PatientInfoPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Patient info section - 25mm height */
        .patient-info-section {
          width: 190mm;
          height: 25mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          margin-bottom: 6mm;
          page-break-inside: avoid;
        }

        .patient-info-grid {
          display: flex;
          height: 19mm;
        }

        .patient-info-left {
          width: 130mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3mm;
        }

        .patient-info-right {
          width: 60mm;
          padding-left: 5mm;
        }

        .patient-info-item {
          height: 8mm;
          display: flex;
          flex-direction: column;
        }

        .patient-info-label {
          font-weight: bold;
          font-size: 10pt;
          color: #333;
          height: 3mm;
          line-height: 3mm;
          margin-bottom: 1mm;
        }

        .patient-info-value {
          font-size: 11pt;
          color: #000;
          border-bottom: 0.3mm solid #ccc;
          height: 4mm;
          line-height: 4mm;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      `
    }} />
  );
};

export default PatientInfoPrintStyles;

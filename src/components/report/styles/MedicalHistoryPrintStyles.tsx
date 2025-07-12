
import React from 'react';

const MedicalHistoryPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Medical History & Notes section - flexible height with more space */
        .medical-history-section {
          width: 190mm;
          min-height: 80mm;
          border: 0.5mm solid #000;
          padding: 2mm;
          margin-bottom: 1mm;
          page-break-inside: avoid;
        }

        .medical-history-section h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 0 0 1.5mm 0;
          color: #000;
          height: 3mm;
          line-height: 3mm;
        }

        .history-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5mm;
        }

        .history-item {
          min-height: 20mm;
          display: flex;
          flex-direction: column;
        }

        .history-label {
          font-weight: bold;
          font-size: 10pt;
          color: #000;
          height: 3mm;
          line-height: 3mm;
          margin-bottom: 1mm;
        }

        .history-text {
          font-size: 10pt;
          color: #000;
          line-height: 1.3;
          width: 100%;
          background: none;
          border: none;
          resize: none;
          min-height: 15mm;
        }

        /* Hide empty history items */
        .history-item:empty,
        .history-item .history-text:empty {
          display: none;
        }
      }
      `
    }} />
  );
};

export default MedicalHistoryPrintStyles;

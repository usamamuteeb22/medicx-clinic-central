
import React from 'react';

const MedicalHistoryPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Medical History & Notes section - flexible height with more space */
        .medical-history-section {
          width: 190mm;
          min-height: 60mm;
          border: 0.5mm solid #000;
          padding: 2mm;
          margin-bottom: 5mm;
          page-break-inside: avoid;
        }

        .medical-history-section h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 0 0 2mm 0;
          color: #000;
          height: 3mm;
          line-height: 3mm;
        }

        .history-grid {
          display: flex;
          flex-direction: column;
          gap: 2mm;
        }

        .history-item {
          min-height: 15mm;
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
          min-height: 10mm;
        }

        /* Hide empty history items and their labels */
        .history-item:empty,
        .history-item.empty-section {
          display: none !important;
        }
      }
      `
    }} />
  );
};

export default MedicalHistoryPrintStyles;

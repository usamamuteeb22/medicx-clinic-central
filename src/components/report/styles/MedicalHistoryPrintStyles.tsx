
import React from 'react';

const MedicalHistoryPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Medical History & Notes section - 60mm height */
        .medical-history-section {
          width: 190mm;
          min-height: 60mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          margin-bottom: 6mm;
          page-break-inside: avoid;
        }

        .medical-history-section h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 0 0 3mm 0;
          color: #000;
          height: 4mm;
          line-height: 4mm;
        }

        .history-grid {
          display: flex;
          flex-direction: column;
          gap: 3mm;
          height: 50mm;
        }

        .history-item {
          height: 15mm;
          display: flex;
          flex-direction: column;
        }

        .history-label {
          font-weight: bold;
          font-size: 10pt;
          color: #333;
          height: 3mm;
          line-height: 3mm;
          margin-bottom: 1mm;
        }

        .history-text {
          font-size: 10pt;
          color: #000;
          border: 0.3mm solid #ccc;
          padding: 2mm;
          height: 11mm;
          width: 100%;
          background: none;
          line-height: 1.3;
          overflow: hidden;
          resize: none;
        }
      }
      `
    }} />
  );
};

export default MedicalHistoryPrintStyles;


import React from 'react';

const MedicalHistoryPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Medical History & Notes section */
        .medical-history-section {
          margin: 20px 0;
          page-break-inside: avoid;
        }

        .medical-history-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 12px 0;
          color: #000;
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
        }

        .history-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
        }

        .history-item {
          border: none;
          padding: 0;
          margin: 0;
        }

        .history-label {
          font-weight: bold;
          font-size: 11pt;
          color: #333;
          display: block;
          margin-bottom: 4px;
        }

        .history-text {
          font-size: 12pt;
          color: #000;
          border: 1px solid #ccc;
          padding: 8px;
          min-height: 50px;
          width: 100%;
          background: none;
          line-height: 1.5;
        }
      }
      `
    }} />
  );
};

export default MedicalHistoryPrintStyles;

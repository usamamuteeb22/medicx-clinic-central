
import React from 'react';

const MedicalHistoryPrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .medical-history-section {
          width: calc(100% + 20px);
          margin-left: -10px;
          margin-right: -10px;
          margin-bottom: 3mm;
          page-break-inside: avoid;
          border: 1pt solid #000;
          padding: 4mm;
        }
        
        .medical-history-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }
        
        .history-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3mm;
          width: 100%;
        }
        
        .history-item {
          display: flex;
          flex-direction: column;
          font-size: 10pt;
          min-height: 8mm;
        }
        
        .history-label {
          font-weight: bold;
          margin-bottom: 1mm;
          color: #000;
        }
        
        .history-text {
          color: #000;
          line-height: 1.4;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
      }
      `,
    }}
  />
);

export default MedicalHistoryPrintStyles;

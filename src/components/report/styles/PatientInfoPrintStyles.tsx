
import React from 'react';

const PatientInfoPrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .patient-info-section {
          width: calc(100% + 20px);
          margin-left: -10px;
          margin-right: -10px;
          margin-bottom: 2mm;
          margin-top: 0mm;
          page-break-inside: avoid;
          border: 1pt solid #000;
          padding:1mm 4mm;
        }
        
        .patient-info-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }
        
        .patient-info-grid {
          width: 100%;
        }
        
        .patient-info-content {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1mm;
          width: 100%;
        }
        
        .patient-info-item {
          display: flex;
          flex-direction: row;
          font-size: 10pt;
          min-height: 8mm;
          max-width: 45mm;
        }
        
        .patient-info-label {
          font-weight: bold;
          margin-bottom: 1mm;
          color: #000;
          white-space: nowrap;
        }
        
        .patient-info-value {
          color: #000;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      }
      `,
    }}
  />
);

export default PatientInfoPrintStyles;

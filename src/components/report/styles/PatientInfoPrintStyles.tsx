
import React from 'react';

const PatientInfoPrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .patient-info-section {
          width: 100%;
          margin-bottom: 7mm;
          page-break-inside: avoid;
          border: 1pt solid #000;
          padding: 4mm;
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
          gap: 3mm;
          width: 100%;
        }
        
        .patient-info-item {
          display: flex;
          flex-direction: column;
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

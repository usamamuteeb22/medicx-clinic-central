
import React from 'react';

const PatientInfoPrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .patient-info-section {
          width: 190mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          margin-top: 8mm;
          margin-bottom: 3mm;
          page-break-inside: avoid;
        }
        
        .patient-info-section h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }
        
        .patient-info-grid {
          width: 100%;
        }
        
        .patient-info-content {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2mm 6mm;
        }
        
        .patient-info-item {
          display: flex;
          align-items: center;
          font-size: 10pt;
          min-height: 6mm;
        }
        
        .patient-info-label {
          font-weight: bold;
          margin-right: 2mm;
          color: #000;
          white-space: nowrap;
        }
        
        .patient-info-value {
          color: #000;
          word-wrap: break-word;
        }
      }
      `,
    }}
  />
);

export default PatientInfoPrintStyles;

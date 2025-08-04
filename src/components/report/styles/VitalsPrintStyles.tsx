
import React from 'react';

const VitalsPrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .medical-vitals-section {
          width: 100%;
          margin-bottom: 7mm;
          page-break-inside: avoid;
        }
        
        .medical-vitals-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }
        
        .vitals-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3mm;
          width: 100%;
        }
        
        .vital-item {
          display: flex;
          align-items: center;
          font-size: 10pt;
          min-height: 6mm;
        }
        
        .vital-label {
          font-weight: bold;
          margin-right: 2mm;
          color: #000;
          white-space: nowrap;
          min-width: 30mm;
        }
        
        .vital-value {
          color: #000;
          word-wrap: break-word;
        }
        
        .clinical-complaint-section {
          width: 100%;
          margin-bottom: 7mm;
          page-break-inside: avoid;
        }
        
        .clinical-complaint-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }
        
        .clinical-complaint-text {
          font-size: 10pt;
          color: #000;
          line-height: 1.3;
          word-wrap: break-word;
        }
      }
      `,
    }}
  />
);

export default VitalsPrintStyles;

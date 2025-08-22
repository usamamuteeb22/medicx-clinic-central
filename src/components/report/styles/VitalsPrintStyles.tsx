
import React from 'react';

const VitalsPrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .medical-vitals-section {
          width: calc(100% + 20px);
          margin-left: -10px;
          margin-right: -10px;
          margin-top: 0mm;
          margin-bottom: 0mm;
          page-break-inside: avoid;
          border: 1pt solid #000;
          padding: 1mm 4mm;
        }
        
        .medical-vitals-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 2mm 0;
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
          min-height: 3mm;
        }
        
        .vital-item input {
          border: none !important;
          background: transparent !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
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
        
        /* Add units after vital values */
        .vital-item[data-vital="blood_pressure"] .vital-value::after {
          content: " mmHg";
        }
        
        .vital-item[data-vital="temperature"] .vital-value::after {
          content: "°F";
        }
        
        .vital-item[data-vital="weight"] .vital-value::after {
          content: " kg";
        }
        
        .vital-item[data-vital="bsr"] .vital-value::after {
          content: " mg/dL";
        }
        
        .vital-item[data-vital="saturation"] .vital-value::after {
          content: "%";
        }
      }
      `,
    }}
  />
);

export default VitalsPrintStyles;

import React from 'react';

const VitalsPrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .medical-vitals-section {
          width: 190mm;
          border: 0.5mm solid #000;
          padding: 2mm;
          margin-bottom: 1mm;
          page-break-inside: avoid;
        }
        .medical-vitals-section h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 0 0 2mm 0;
          color: #000;
        }
        .vitals-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: auto;
          gap: 1mm 3mm;
        }
        .vital-item {
          display: flex;
          align-items: center;
          font-size: 10pt;
          overflow: hidden;
        }
        .vital-label {
          font-weight: bold;
          margin-right: 1.5mm;
        }
        .vital-value {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .clinical-complaint-section {
          width: 190mm;
          border: 0.5mm solid #000;
          padding: 2mm;
          margin-bottom: 1mm;
          page-break-inside: avoid;
        }
        .clinical-complaint-section h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 0 0 2mm 0;
          color: #000;
        }
        .clinical-complaint-text {
          font-size: 10pt;
          color: #000;
          line-height: 1.3;
          width: 100%;
          white-space: pre-wrap;
        }
        input, textarea {
          display: none !important;
        }
      }
      `,
    }}
  />
);

export default VitalsPrintStyles;


import React from 'react';

const VitalsPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Medical Vitals section - 30mm height */
        .medical-vitals-section {
          width: 190mm;
          height: 30mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          margin-bottom: 6mm;
          page-break-inside: avoid;
        }

        .medical-vitals-section h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 0 0 3mm 0;
          color: #000;
          height: 4mm;
          line-height: 4mm;
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 3mm;
          height: 20mm;
        }

        .vital-item {
          height: 8mm;
          display: flex;
          flex-direction: column;
        }

        .vital-label {
          font-weight: bold;
          font-size: 9pt;
          color: #333;
          height: 3mm;
          line-height: 3mm;
          margin-bottom: 1mm;
        }

        .vital-value {
          font-size: 10pt;
          color: #000;
          border-bottom: 0.3mm solid #ccc;
          height: 4mm;
          line-height: 4mm;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Clinical Complaint section - 25mm height */
        .clinical-complaint-section {
          width: 190mm;
          height: 25mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          margin-bottom: 6mm;
          page-break-inside: avoid;
        }

        .clinical-complaint-label {
          font-weight: bold;
          font-size: 11pt;
          color: #000;
          height: 4mm;
          line-height: 4mm;
          margin-bottom: 2mm;
        }

        .clinical-complaint-text {
          font-size: 10pt;
          color: #000;
          border: 0.3mm solid #ccc;
          padding: 2mm;
          height: 14mm;
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

export default VitalsPrintStyles;

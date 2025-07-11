
import React from 'react';

const VitalsPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Clean styling for Medical Vitals section */
        .medical-vitals-section {
          margin: 20px 0;
          page-break-inside: avoid;
        }

        .medical-vitals-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 12px 0;
          color: #000;
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 15px;
        }

        .vital-item {
          border: none;
          padding: 0;
          margin: 0;
        }

        .vital-label {
          font-weight: bold;
          font-size: 11pt;
          color: #333;
          display: block;
          margin-bottom: 2px;
        }

        .vital-value {
          font-size: 12pt;
          color: #000;
          border: none;
          background: none;
          padding: 4px 0;
          border-bottom: 1px solid #ccc;
          display: block;
          width: 100%;
          min-height: 18px;
        }

        /* Clean styling for Clinical Complaint */
        .clinical-complaint {
          margin: 15px 0;
          page-break-inside: avoid;
        }

        .clinical-complaint-label {
          font-weight: bold;
          font-size: 11pt;
          color: #333;
          display: block;
          margin-bottom: 4px;
        }

        .clinical-complaint-text {
          font-size: 12pt;
          color: #000;
          border: 1px solid #ccc;
          padding: 8px;
          min-height: 60px;
          width: 100%;
          background: none;
          line-height: 1.5;
        }
      }
      `
    }} />
  );
};

export default VitalsPrintStyles;

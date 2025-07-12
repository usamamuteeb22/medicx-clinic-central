
import React from 'react';

const BasePrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box;
        }

        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.3;
          color: #000;
          margin: 0;
          padding: 0;
        }

        .report-container {
          width: 190mm;
          max-width: 190mm;
          margin: 0 auto;
          padding: 0;
          background: white;
        }

        .content {
          width: 100%;
        }

        /* Hide UI elements not needed in print */
        .no-print,
        button,
        .print-hide {
          display: none !important;
        }

        /* Remove input styling for print */
        input, textarea, select {
          border: none !important;
          background: none !important;
          box-shadow: none !important;
          outline: none !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Section spacing - minimized */
        .report-section {
          margin-bottom: 2mm;
          border: 0.5mm solid #000;
          page-break-inside: avoid;
        }

        /* Header section - no border, at top */
        .header {
          height: 35mm;
          width: 190mm;
          margin-bottom: 2mm;
          padding: 3mm 0;
          border: none;
        }

        .header-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          height: 8mm;
          line-height: 8mm;
          margin-bottom: 2mm;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          height: 20mm;
          align-items: flex-start;
        }

        .doctor-info {
          width: 63mm;
          height: 20mm;
          font-size: 10pt;
          line-height: 1.2;
        }

        .timing-info {
          width: 63mm;
          height: 20mm;
          font-size: 10pt;
          line-height: 1.2;
        }

        .doctor-info h4, .timing-info h4 {
          font-size: 11pt;
          font-weight: bold;
          margin: 0 0 1mm 0;
        }

        .doctor-info div, .timing-info div {
          margin: 0.5mm 0;
        }

        .report-meta {
          text-align: right;
          font-size: 10pt;
          height: 4mm;
          line-height: 4mm;
          margin-top: 1mm;
        }

        /* Footer */
        .footer {
          width: 190mm;
          height: 8mm;
          border-top: 0.5mm solid #000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10pt;
          padding: 1mm 0;
          margin-top: 2mm;
        }

        .footer-contact {
          font-weight: bold;
        }

        .footer-address {
          text-align: right;
          line-height: 1.2;
        }
      }
      `
    }} />
  );
};

export default BasePrintStyles;

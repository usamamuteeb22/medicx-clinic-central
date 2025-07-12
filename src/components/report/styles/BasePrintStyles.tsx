
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
          position: relative;
          min-height: 277mm;
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
          margin-bottom: 1mm;
          border: 0.5mm solid #000;
          page-break-inside: avoid;
        }

        /* Header section - no border, at top with minimal spacing */
        .header {
          height: 32mm;
          width: 190mm;
          margin-bottom: 1mm;
          padding: 2mm 0;
          border: none;
        }

        .header-title {
          text-align: center;
          font-size: 13pt;
          font-weight: bold;
          height: 6mm;
          line-height: 6mm;
          margin-bottom: 2mm;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          height: 18mm;
          align-items: flex-start;
        }

        .doctor-info {
          width: 63mm;
          height: 18mm;
          font-size: 9pt;
          line-height: 1.1;
        }

        .timing-info {
          width: 63mm;
          height: 18mm;
          font-size: 9pt;
          line-height: 1.1;
        }

        .doctor-info h4, .timing-info h4 {
          font-size: 10pt;
          font-weight: bold;
          margin: 0 0 1mm 0;
        }

        .doctor-info div, .timing-info div {
          margin: 0.5mm 0;
        }

        .report-meta {
          text-align: right;
          font-size: 9pt;
          height: 4mm;
          line-height: 4mm;
          margin-top: 1mm;
        }

        /* Footer - fixed at bottom */
        .footer {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 190mm;
          height: 10mm;
          border-top: 0.5mm solid #000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10pt;
          padding: 1mm 0;
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

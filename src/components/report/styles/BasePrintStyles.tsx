
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
        }

        @page {
          size: A4;
          margin: 0.75in;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.4;
          color: #000;
        }

        .report-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          background: white;
        }

        .content {
          padding: 0;
          margin: 0;
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
        }

        /* Ensure text is visible */
        input[type="text"], 
        input[type="number"], 
        textarea {
          color: #000 !important;
          background: transparent !important;
        }

        /* Page breaks */
        .page-break-before {
          page-break-before: always;
        }

        .page-break-after {
          page-break-after: always;
        }

        .avoid-break {
          page-break-inside: avoid;
        }

        /* Header and footer spacing */
        .report-header {
          margin-bottom: 25px;
          page-break-after: avoid;
        }

        .report-footer {
          margin-top: 30px;
          page-break-before: avoid;
        }
      }
      `
    }} />
  );
};

export default BasePrintStyles;

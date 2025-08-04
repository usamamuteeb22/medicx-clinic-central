
import React from 'react';

const BasePrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        @page {
          size: A4;
          margin: 8mm;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          font-family: Arial, sans-serif !important;
          font-size: 11pt !important;
          line-height: 1.2 !important;
          color: #000 !important;
          background: white !important;
        }

        .print-hide, .print\\:hidden {
          display: none !important;
        }

        .report-container {
          width: 194mm !important;
          min-height: 277mm !important;
          max-height: 277mm !important;
          display: flex !important;
          flex-direction: column !important;
          background: white !important;
          color: #000 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        .content {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 1mm !important;
          overflow: hidden !important;
        }

        .header {
          height: 25mm !important;
          border-bottom: 0.5mm solid #000 !important;
          margin-bottom: 1mm !important;
        }

        .footer {
          height: 15mm !important;
          border-top: 0.5mm solid #000 !important;
          margin-top: auto !important;
        }

        /* Hide screen-only elements */
        .no-print, .print\\:hidden {
          display: none !important;
        }

        /* Ensure print elements are visible */
        .print\\:block {
          display: block !important;
        }

        /* Section styling */
        .patient-info-section,
        .medical-vitals-section,
        .medicine-section,
        .medical-history-print,
        .print-notes-section {
          page-break-inside: avoid !important;
          margin-bottom: 1mm !important;
        }

        /* Typography */
        h1, h2, h3 {
          color: #000 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        h1 {
          font-size: 14pt !important;
          font-weight: bold !important;
        }

        h2 {
          font-size: 12pt !important;
          font-weight: bold !important;
        }

        h3 {
          font-size: 11pt !important;
          font-weight: bold !important;
        }

        p, div, span {
          color: #000 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
      `
    }} />
  );
};

export default BasePrintStyles;


import React from 'react';

const BasePrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        @page {
          size: A4;
          width: 210mm;
          height: 297mm;
          margin: 10mm 10mm 20mm 10mm;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif !important;
          font-size: 10pt !important;
          line-height: 1.2 !important;
          color: #000 !important;
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .print-hide, .print\\:hidden {
          display: none !important;
        }

        .report-container {
          width: 190mm !important;
          min-height: 267mm !important;
          display: flex !important;
          flex-direction: column !important;
          background: white !important;
          color: #000 !important;
          margin: 0 !important;
          padding: 0 !important;
          position: relative !important;
        }

        .content {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 7mm !important;
        }

        /* Header */
        .report-header {
          text-align: center !important;
          margin-bottom: 5mm !important;
        }

        .report-header h1 {
          font-size: 16pt !important;
          font-weight: bold !important;
          margin: 0 !important;
          color: #000 !important;
        }

        .report-header p {
          font-size: 10pt !important;
          margin: 2mm 0 0 0 !important;
          color: #000 !important;
        }

        /* Report Metadata */
        .report-info {
          text-align: right !important;
          font-size: 10pt !important;
          margin-bottom: 5mm !important;
          color: #000 !important;
        }

        .report-info div {
          margin: 1mm 0 !important;
        }

        /* Sections */
        .patient-info-section,
        .medical-vitals-section,
        .medicine-section,
        .medical-history-print,
        .print-notes-section {
          page-break-inside: avoid !important;
          margin-bottom: 7mm !important;
        }

        /* Section headings */
        h3 {
          font-size: 14pt !important;
          font-weight: bold !important;
          color: #000 !important;
          margin: 0 0 4mm 0 !important;
          padding: 0 !important;
        }

        /* Footer */
        .footer {
          position: fixed !important;
          bottom: 0 !important;
          left: 10mm !important;
          right: 10mm !important;
          height: 20mm !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
          border-top: 0.5mm solid #000 !important;
          padding-top: 3mm !important;
          font-size: 9pt !important;
          color: #000 !important;
          background: white !important;
        }

        .footer-contact, .footer-address {
          margin: 1mm 0 !important;
        }

        /* Hide screen-only elements */
        .no-print, .print\\:hidden {
          display: none !important;
        }

        /* Ensure print elements are visible */
        .print\\:block {
          display: block !important;
        }

        /* Typography */
        h1, h2, h3 {
          color: #000 !important;
        }

        h1 {
          font-size: 16pt !important;
          font-weight: bold !important;
        }

        h2 {
          font-size: 14pt !important;
          font-weight: bold !important;
        }

        h3 {
          font-size: 14pt !important;
          font-weight: bold !important;
        }

        p, div, span, td, th {
          color: #000 !important;
        }
      }
      `
    }} />
  );
};

export default BasePrintStyles;


import React from 'react';

const BasePrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          box-sizing: border-box;
        }
        
        @page {
          size: A4;
          margin: 10mm 10mm 20mm 10mm;
        }
        
        body {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          font-size: 10pt;
          line-height: 1.3;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 0;
        }
        
        .report-container {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          padding: 0;
          position: relative;
          min-height: 257mm;
        }
        
        .content {
          padding-bottom: 5mm;
        }
        
        /* Section spacing - reduced to 3mm */
        .patient-info-section,
        .medical-vitals-section,
        .clinical-complaint-section,
        .medicines-section,
        .notes-section,
        .medical-history-section {
          margin-bottom: 0.5mm;
        }
        
        .footer {
          position: fixed;
          bottom: 0;
          left: 10mm;
          right: 10mm;
          height: 20mm;
          display: flex;
          justify-content: space-around;
          align-items: center;
          font-size: 9pt;
          color: #000;
          border-top: 1pt solid #000;
          padding-top: 3mm;
        }
        
        .footer-contact {
          margin-bottom: 1mm;
        }
        
        .footer-address {
          font-size: 8pt;
        }
        
        /* Report Header */
        .report-header {
          width: 100%;
          margin-bottom: 5mm;
          padding-bottom: 3mm;
          border-bottom: 2pt solid #000;
        }
        
        .clinic-info h1 {
          font-size: 16pt;
          font-weight: bold;
          text-align: center;
          margin: 0;
          color: #000;
        }
        
        .report-info {
          display: flex;
          justify-content: flex-end;
          gap: 10mm;
          margin-top: 3mm;
          font-size: 10pt;
        }
        
        .report-id,
        .report-date,
        .report-time {
          font-weight: bold;
          color: #000;
        }
        
        /* Hide non-print elements */
        .no-print,
        .print\\:hidden {
          display: none !important;
        }
        
        /* Prevent page breaks within sections */
        .patient-info-section,
        .medical-vitals-section,
        .clinical-complaint-section,
        .medicines-section {
          page-break-inside: avoid;
        }
        
        /* Table styling */
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
        }
        
        th, td {
          border: 1pt solid #000;
          padding: 2mm;
          text-align: left;
          vertical-align: top;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
      }
      `,
    }}
  />
);

export default BasePrintStyles;

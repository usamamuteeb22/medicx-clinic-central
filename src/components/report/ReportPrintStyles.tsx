
import React from 'react';

const ReportPrintStyles = () => {
  return (
    <style jsx>{`
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

        /* Medical History & Notes section */
        .medical-history-section {
          margin: 20px 0;
          page-break-inside: avoid;
        }

        .medical-history-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 12px 0;
          color: #000;
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
        }

        .history-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
        }

        .history-item {
          border: none;
          padding: 0;
          margin: 0;
        }

        .history-label {
          font-weight: bold;
          font-size: 11pt;
          color: #333;
          display: block;
          margin-bottom: 4px;
        }

        .history-text {
          font-size: 12pt;
          color: #000;
          border: 1px solid #ccc;
          padding: 8px;
          min-height: 50px;
          width: 100%;
          background: none;
          line-height: 1.5;
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

        /* Medicine table styling */
        .medicine-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }

        .medicine-table th,
        .medicine-table td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
          font-size: 11pt;
        }

        .medicine-table th {
          background-color: #f0f0f0 !important;
          font-weight: bold;
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

        /* Patient info section */
        .patient-info-section {
          margin: 20px 0;
          page-break-inside: avoid;
        }

        .patient-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .patient-info-item {
          padding: 0;
          margin: 0;
        }

        .patient-info-label {
          font-weight: bold;
          font-size: 11pt;
          color: #333;
          display: block;
          margin-bottom: 2px;
        }

        .patient-info-value {
          font-size: 12pt;
          color: #000;
          border-bottom: 1px solid #ccc;
          padding: 4px 0;
          display: block;
          min-height: 18px;
        }
      }
    `}</style>
  );
};

export default ReportPrintStyles;

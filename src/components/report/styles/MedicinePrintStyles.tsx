
import React from 'react';

const MedicinePrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Medicine section - dynamic height based on content */
        .medicine-section {
          width: 190mm;
          min-height: 25mm;
          border: 0.5mm solid #000;
          padding: 2mm;
          margin-bottom: 2mm;
          page-break-inside: avoid;
        }

        .medicine-section h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 0 0 2mm 0;
          color: #000;
          height: 4mm;
          line-height: 4mm;
        }

        .medicine-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1mm;
        }

        .medicine-table th {
          background-color: #f0f0f0 !important;
          font-weight: bold;
          font-size: 9pt;
          height: 5mm;
          line-height: 5mm;
          border: 0.3mm solid #333;
          padding: 1mm;
          text-align: center;
        }

        .medicine-table td {
          font-size: 9pt;
          height: 5mm;
          line-height: 5mm;
          border: 0.3mm solid #333;
          padding: 1mm;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .medicine-table th:nth-child(1),
        .medicine-table td:nth-child(1) {
          width: 25%;
          text-align: left;
        }

        .medicine-table th:nth-child(2),
        .medicine-table td:nth-child(2) {
          width: 15%;
        }

        .medicine-table th:nth-child(3),
        .medicine-table td:nth-child(3) {
          width: 10%;
        }

        .medicine-table th:nth-child(4),
        .medicine-table td:nth-child(4) {
          width: 10%;
        }

        .medicine-table th:nth-child(5),
        .medicine-table td:nth-child(5) {
          width: 20%;
          text-align: left;
        }

        .medicine-table th:nth-child(6),
        .medicine-table td:nth-child(6) {
          width: 20%;
          text-align: left;
        }

        .medicine-table .capitalize {
          text-transform: capitalize;
        }

        /* Medicine note rows */
        .medicine-note-row td {
          background-color: #f9f9f9 !important;
          border-top: none !important;
          height: auto !important;
          white-space: normal !important;
          text-overflow: initial !important;
          overflow: visible !important;
        }

        .medicine-note {
          font-size: 8pt !important;
          font-style: italic;
          color: #666 !important;
          padding: 2mm !important;
          text-align: left !important;
          line-height: 1.2;
        }

        /* Print Notes Section */
        .print-notes-section {
          width: 190mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          margin-bottom: 2mm;
          min-height: 30mm;
          page-break-inside: avoid;
        }

        .print-notes-section h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 0 0 3mm 0;
          color: #000;
        }

        .notes-blank-area {
          height: 25mm;
          background: transparent;
          border: none;
        }
      }
      `
    }} />
  );
};

export default MedicinePrintStyles;

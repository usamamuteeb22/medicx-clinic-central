
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
          margin-bottom: 1mm;
          page-break-inside: avoid;
        }

        .medicine-section h3 {
          font-size: 11pt;
          font-weight: bold;
          margin: 0 0 1.5mm 0;
          color: #000;
          height: 3mm;
          line-height: 3mm;
        }

        .medicine-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1.5mm;
        }

        .medicine-table th {
          background-color: #f0f0f0 !important;
          font-weight: bold;
          font-size: 10pt;
          height: 5mm;
          line-height: 5mm;
          border: 0.3mm solid #333;
          padding: 1mm;
          text-align: center;
        }

        .medicine-table td {
          font-size: 10pt;
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
          width: 35%;
          text-align: left;
        }

        .medicine-table th:nth-child(2),
        .medicine-table td:nth-child(2) {
          width: 20%;
        }

        .medicine-table th:nth-child(3),
        .medicine-table td:nth-child(3) {
          width: 15%;
        }

        .medicine-table th:nth-child(4),
        .medicine-table td:nth-child(4) {
          width: 30%;
          text-align: left;
        }

        .medicine-table .capitalize {
          text-transform: capitalize;
        }
      }
      `
    }} />
  );
};

export default MedicinePrintStyles;

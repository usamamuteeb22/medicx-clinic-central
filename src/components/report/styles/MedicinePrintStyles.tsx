
import React from 'react';

const MedicinePrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        /* Medicine section - 50mm height */
        .medicine-section {
          width: 190mm;
          min-height: 50mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          margin-bottom: 6mm;
          page-break-inside: avoid;
        }

        .section-title {
          font-size: 12pt;
          font-weight: bold;
          margin: 0 0 3mm 0;
          color: #000;
          height: 4mm;
          line-height: 4mm;
        }

        .medicine-table {
          width: 184mm;
          border-collapse: collapse;
          height: 40mm;
        }

        .medicine-table th {
          background-color: #f5f5f5 !important;
          font-weight: bold;
          font-size: 10pt;
          height: 8mm;
          line-height: 8mm;
          border: 0.3mm solid #333;
          padding: 1mm 2mm;
          text-align: left;
        }

        .medicine-table td {
          font-size: 10pt;
          height: 8mm;
          line-height: 8mm;
          border: 0.3mm solid #333;
          padding: 1mm 2mm;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .medicine-table th:nth-child(1),
        .medicine-table td:nth-child(1) {
          width: 50mm;
        }

        .medicine-table th:nth-child(2),
        .medicine-table td:nth-child(2) {
          width: 40mm;
        }

        .medicine-table th:nth-child(3),
        .medicine-table td:nth-child(3) {
          width: 30mm;
        }

        .medicine-table th:nth-child(4),
        .medicine-table td:nth-child(4) {
          width: 64mm;
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

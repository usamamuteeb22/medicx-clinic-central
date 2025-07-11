
import React from 'react';

const MedicinePrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
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
      }
      `
    }} />
  );
};

export default MedicinePrintStyles;

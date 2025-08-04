
import React from 'react';

const MedicinePrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .medicine-section {
          width: 100%;
          margin-bottom: 7mm;
          page-break-inside: avoid;
        }
        
        .medicine-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }
        
        .medicine-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
        }
        
        .medicine-table th {
          background: none;
          border: 0.5mm solid #000;
          padding: 2mm;
          text-align: left;
          font-weight: bold;
          color: #000;
          height: 7mm;
        }
        
        .medicine-table td {
          border: 0.5mm solid #000;
          padding: 2mm;
          color: #000;
          height: 7mm;
          vertical-align: top;
        }
        
        .medicine-note-row td {
          border-left: 0.5mm solid #000;
          border-right: 0.5mm solid #000;
          border-bottom: 0.5mm solid #000;
          border-top: none;
          padding: 2mm;
          font-style: italic;
          font-size: 10pt;
          color: #000;
          background: #f9f9f9;
        }
        
        .capitalize {
          text-transform: capitalize;
        }
      }
      `,
    }}
  />
);

export default MedicinePrintStyles;

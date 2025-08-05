
import React from 'react';

const MedicinePrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .medicines-section {
          width: calc(100% + 20px);
          margin-left: -10px;
          margin-right: -10px;
          margin-bottom: 3mm;
          page-break-inside: avoid;
        }
        
        .medicines-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
          border-bottom: 1pt solid #000;
          padding-bottom: 2mm;
        }
        
        .medicines-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
          border: 1pt solid #000;
        }
        
        .medicines-table th,
        .medicines-table td {
          border: 1pt solid #000;
          padding: 2mm;
          text-align: left;
          vertical-align: top;
        }
        
        .medicines-table th {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 10pt;
        }
        
        .medicines-table tr {
          page-break-inside: avoid;
        }
        
        .medicine-note-row {
          background-color: #f9f9f9;
        }
        
        .medicine-note-row td {
          font-style: italic;
          padding-top: 2mm;
          border-top: none;
          font-size: 10pt;
        }
        
        .medicine-note-content {
          margin-left: 5mm;
        }
      }
      `,
    }}
  />
);

export default MedicinePrintStyles;

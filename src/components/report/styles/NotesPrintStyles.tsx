
import React from 'react';

const NotesPrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .print-notes-section {
          width: 100%;
          margin-bottom: 7mm;
          page-break-inside: avoid;
          flex: 1;
        }
        
        .print-notes-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }
        
        .notes-blank-area {
          min-height: 30mm;
          border: none;
          background: white;
          width: 100%;
          font-size: 10pt;
          line-height: 1.4;
          color: #000;
        }
      }
      `,
    }}
  />
);

export default NotesPrintStyles;

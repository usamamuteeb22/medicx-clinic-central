
import React from 'react';

const NotesPrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .notes-section {
          width: calc(100% + 20px);
          margin-left: -10px;
          margin-right: -10px;
          margin-bottom: 3mm;
          page-break-inside: avoid;
          border: 1pt solid #000;
          padding: 4mm;
        }
        
        .notes-section h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }
        
        .notes-content {
          font-size: 10pt;
          color: #000;
          line-height: 1.4;
          word-wrap: break-word;
          white-space: pre-wrap;
          min-height: 20mm;
        }
      }
      `,
    }}
  />
);

export default NotesPrintStyles;

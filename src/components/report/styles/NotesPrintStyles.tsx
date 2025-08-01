
import React from 'react';

const NotesPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .notes-print-section {
          width: 190mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          margin-bottom: 3mm;
          page-break-inside: avoid;
        }

        .notes-print-section h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }

        .notes-print-section .space-y-3 > div {
          margin-bottom: 3mm;
        }

        .notes-print-section .font-bold {
          font-weight: bold;
          color: #000;
          margin-bottom: 1mm;
        }

        .notes-print-section .text-sm {
          font-size: 10pt;
          line-height: 1.3;
          color: #000;
          word-wrap: break-word;
        }

        .handwritten-notes-box {
          margin-top: 5mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          min-height: 40mm;
        }

        .handwritten-notes-box .font-bold {
          font-weight: bold;
          color: #000;
          margin-bottom: 2mm;
        }

        .notes-blank-area {
          height: 35mm;
          background: transparent;
          border: none;
        }
      }
      `
    }} />
  );
};

export default NotesPrintStyles;

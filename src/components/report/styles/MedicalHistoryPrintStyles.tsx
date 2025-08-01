
import React from 'react';

const MedicalHistoryPrintStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      @media print {
        .medical-history-print {
          width: 190mm;
          border: 0.5mm solid #000;
          padding: 3mm;
          margin-bottom: 5mm;
          page-break-inside: avoid;
        }

        .medical-history-print h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 0 0 4mm 0;
          color: #000;
        }

        .medical-history-print .space-y-3 > div {
          margin-bottom: 3mm;
        }

        .medical-history-print .font-bold {
          font-weight: bold;
          color: #000;
          margin-bottom: 1mm;
        }

        .medical-history-print .text-sm {
          font-size: 10pt;
          line-height: 1.3;
          color: #000;
          word-wrap: break-word;
        }
      }
      `
    }} />
  );
};

export default MedicalHistoryPrintStyles;

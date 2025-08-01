
import React from 'react';

const BasePrintStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        @page {
          size: A4;
          margin: 10mm;
        }
        
        body, html {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: white;
        }
        
        .report-container {
          width: 190mm;
          min-height: 277mm;
          background: white;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .content {
          flex: 1;
        }
        
        .print\\:hidden {
          display: none !important;
        }
        
        .hidden.print\\:block {
          display: block !important;
        }
        
        .no-print {
          display: none !important;
        }
        
        input, textarea, button {
          display: none !important;
        }
        
        .footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          margin-top: auto;
        }
      }
      `,
    }}
  />
);

export default BasePrintStyles;

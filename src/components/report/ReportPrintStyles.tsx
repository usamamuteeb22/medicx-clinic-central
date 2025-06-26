
import React from 'react';

const ReportPrintStyles: React.FC = () => {
  return (
    <style>
      {`
        @page {
          size: A4 portrait;
          margin: 5mm 7mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Roboto', 'Arial', sans-serif;
          font-size: 10pt;
          line-height: 1.1;
          color: #000;
          height: 100vh;
          width: 100%;
        }
        .report-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        /* Header Section - 15-17% of page height */
        .header {
          height: 16%;
          border-bottom: 1px solid #ccc;
          padding: 3mm 0 2mm 0;
          margin-bottom: 2mm;
        }
        .header-title {
          text-align: center;
          font-size: 17pt;
          font-weight: bold;
          margin-bottom: 4mm;
          line-height: 1.2;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 11pt;
          margin-bottom: 2mm;
        }
        .doctor-info {
          flex: 1;
          line-height: 1.2;
        }
        .doctor-info h4 {
          font-weight: bold;
          margin-bottom: 1mm;
          font-size: 12pt;
        }
        .doctor-info div {
          margin-bottom: 0.5mm;
        }
        .timing-info {
          text-align: right;
          flex: 0 0 100px;
          line-height: 1.2;
        }
        .timing-info h4 {
          font-weight: bold;
          margin-bottom: 1mm;
          font-size: 12pt;
        }
        .report-meta {
          text-align: right;
          font-size: 10pt;
          margin-top: 2mm;
          line-height: 1.1;
        }
        
        /* Content Area - Dynamic height */
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2mm;
          min-height: 0;
        }
        
        /* Section Styling */
        .section {
          border: 0.5px solid #ccc;
          padding: 2mm 3mm;
          background: #fff;
          margin-bottom: 1mm;
        }
        .section-title {
          font-weight: bold;
          font-size: 11pt;
          margin-bottom: 2mm;
          border-bottom: 0.5px solid #ddd;
          padding-bottom: 1mm;
          line-height: 1.1;
        }
        
        /* Patient Information - Fixed 18mm height */
        .patient-section {
          height: 18mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .patient-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
          gap: 4mm;
          font-size: 10pt;
          line-height: 1.2;
        }
        .patient-info-item {
          display: flex;
          flex-direction: column;
        }
        .patient-info-item strong {
          font-weight: bold;
          margin-bottom: 0.5mm;
        }
        
        /* Medical Vitals - Fixed 18mm height */
        .vitals-section {
          height: 18mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .vitals-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 4mm;
          font-size: 10pt;
          line-height: 1.2;
        }
        .vitals-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4mm;
        }
        .vital-item {
          display: flex;
          flex-direction: column;
        }
        .vital-item strong {
          font-weight: bold;
          margin-bottom: 0.5mm;
        }
        
        /* Clinical Details - Max 24mm height */
        .clinical-section {
          max-height: 24mm;
          overflow: hidden;
        }
        .clinical-content {
          font-size: 10pt;
          line-height: 1.3;
          text-align: justify;
        }
        
        /* Medicine Table - Dynamic height up to 60mm */
        .medicine-section {
          max-height: 60mm;
          overflow: hidden;
        }
        .medicine-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
          line-height: 1.1;
        }
        .medicine-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          font-size: 11pt;
          padding: 2mm;
          border: 0.5px solid #ccc;
          text-align: left;
          height: 8mm;
        }
        .medicine-table td {
          padding: 2mm;
          border: 0.5px solid #ccc;
          text-align: left;
          vertical-align: top;
          height: 8mm;
        }
        
        /* Medical History - Dynamic height up to 60mm */
        .history-section {
          flex: 1;
          max-height: 60mm;
          overflow: hidden;
        }
        .history-item {
          margin-bottom: 2mm;
        }
        .history-item h4 {
          font-weight: bold;
          margin-bottom: 1mm;
          font-size: 10pt;
        }
        .history-item p {
          line-height: 1.3;
          font-size: 10pt;
          text-align: justify;
          margin-bottom: 1mm;
        }
        
        /* Footer - 6-8% of page height */
        .footer {
          height: 7%;
          border-top: 1px solid #ccc;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2mm 0;
          margin-top: 2mm;
          font-size: 10pt;
          line-height: 1.2;
        }
        .footer-contact {
          font-weight: bold;
        }
        .footer-address {
          text-align: right;
          font-weight: bold;
          max-width: 60%;
        }
        
        @media print {
          .no-print { display: none !important; }
          body { print-color-adjust: exact; }
        }
      `}
    </style>
  );
};

export default ReportPrintStyles;

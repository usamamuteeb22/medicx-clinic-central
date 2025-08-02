
import React from 'react';

interface ReportHeaderProps {
  reportId: string;
  currentDate: string;
  currentTime: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ reportId, currentDate, currentTime }) => {
  return (
    <div className="report-header">
      <div className="clinic-info">
        <h1>Awam Dost Dispensary</h1>
        <p>Comprehensive Medical Care</p>
      </div>
      
      <div className="report-info">
        <div className="report-id">Report ID: {reportId.slice(0, 8)}</div>
        <div className="report-date">Date: {currentDate}</div>
        <div className="report-time">Time: {currentTime}</div>
      </div>
    </div>
  );
};

export default ReportHeader;

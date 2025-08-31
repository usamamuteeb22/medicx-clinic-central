
import React from 'react';

interface ReportHeaderProps {
  reportNumber?: number;
  currentDate?: string;
  currentTime?: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ reportNumber, currentDate, currentTime }) => {
  const now = new Date();
  const displayDate = currentDate || now.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const displayTime = currentTime || now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="report-header">
      <div className="clinic-info">
        <h1>Awam Dost Dispensary</h1>
      </div>
      
      <div className="report-info">
        <div className="report-id">Report ID: {reportNumber || 'N/A'}</div>
        <div className="report-date">Date: {displayDate}</div>
        <div className="report-time">Time: {displayTime}</div>
      </div>
    </div>
  );
};

export default ReportHeader;

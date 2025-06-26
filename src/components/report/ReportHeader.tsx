
import React from 'react';

interface ReportHeaderProps {
  reportId: string;
  currentDate: string;
  currentTime: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  reportId,
  currentDate,
  currentTime
}) => {
  return (
    <div className="header">
      <div className="header-title">
        Project: Awaam Dost Welfare Organization Kasur
      </div>
      <div className="header-content">
        <div className="doctor-info">
          <h4>Dr. Muhammad Jaffar</h4>
          <div>MBBS/MD</div>
          <div>EX. Medical Officer</div>
          <div>Children Hospital, Lahore</div>
        </div>
        <div className="doctor-info">
          <h4>Dr. Muhammad Kamal</h4>
          <div>MBBS, FCPS</div>
          <div>Consultant: Pediatrician</div>
          <div>DHQ Hospital Kasur</div>
          <div>Ex Senior Registrar</div>
          <div>Children Hospital & ICH, Lahore</div>
        </div>
        <div className="timing-info">
          <h4>Timing</h4>
          <div>3:00 pm to 6:00 pm</div>
        </div>
      </div>
      <div className="report-meta">
        Report ID: {reportId.slice(0, 8)} | Date: {currentDate} | Time: {currentTime}
      </div>
    </div>
  );
};

export default ReportHeader;

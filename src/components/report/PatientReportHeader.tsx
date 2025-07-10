
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PatientReportHeaderProps {
  onNewReport: () => void;
}

const PatientReportHeader: React.FC<PatientReportHeaderProps> = ({ onNewReport }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Report & Prescription</h1>
        <p className="text-gray-600">Create medical reports and prescribe medicines</p>
      </div>
      <Button 
        onClick={onNewReport}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <Plus className="h-4 w-4" />
        <span>New Report</span>
      </Button>
    </div>
  );
};

export default PatientReportHeader;

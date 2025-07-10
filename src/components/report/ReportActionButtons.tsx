
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';

interface ReportActionButtonsProps {
  loading: boolean;
  savedReportId: string | null;
  onSaveReport: () => void;
  onViewPDF: () => void;
}

const ReportActionButtons: React.FC<ReportActionButtonsProps> = ({
  loading,
  savedReportId,
  onSaveReport,
  onViewPDF
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-end space-x-4">
          <Button
            onClick={onSaveReport}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save & Generate Report'}</span>
          </Button>
          {savedReportId && (
            <Button
              onClick={onViewPDF}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>View PDF Report</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportActionButtons;

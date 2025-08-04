
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Phone } from 'lucide-react';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age?: number;
  age_years?: number;
  age_months?: number;
  age_days?: number;
  gender: string;
  phone_number: string;
  cnic?: string;
  category?: string;
}

interface ReceptionReport {
  id: string;
  patient_id: string;
  created_at: string;
  patient: Patient;
}

interface LatestReceptionReportProps {
  onReportSelect: (report: ReceptionReport) => void;
}

const LatestReceptionReport: React.FC<LatestReceptionReportProps> = ({ onReportSelect }) => {
  const { data: latestReport, isLoading } = useQuery({
    queryKey: ['latestReceptionReport'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_reports')
        .select(`
          id,
          patient_id,
          created_at,
          created_by_role
        `)
        .eq('created_by_role', 'reception')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return null;
        }
        throw error;
      }

      // Fetch complete patient data including all required fields
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, patient_id, name, age, age_years, age_months, age_days, gender, phone_number, cnic, category')
        .eq('id', data.patient_id)
        .single();

      if (patientError) throw patientError;

      return {
        ...data,
        patient: patientData
      } as ReceptionReport;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Latest Reception Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Latest Reception Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No recent reception reports found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-700">
          <Clock className="h-5 w-5" />
          <span>Latest Reception Report</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-sm text-gray-600">Report ID</p>
            <p className="font-medium">{latestReport.id.slice(0, 8)}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Patient</p>
              <p className="font-medium">{latestReport.patient?.name}</p>
              <p className="text-sm text-gray-500">ID: {latestReport.patient?.patient_id}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Date/Time</p>
            <p className="font-medium">
              {new Date(latestReport.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(latestReport.created_at).toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{latestReport.patient?.phone_number || 'N/A'}</span>
            </div>
            <Button 
              onClick={() => onReportSelect(latestReport)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Select Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestReceptionReport;

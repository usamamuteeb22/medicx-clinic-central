
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import ReportsSearchBar from '@/components/reception/ReportsSearchBar';
import ReportsTable from '@/components/reception/ReportsTable';
import ReceptionReportForm from '@/components/reception/ReceptionReportForm';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface PatientReport {
  id: string;
  patient_id: string;
  hemoglobin?: number;
  wbc?: number;
  platelets?: number;
  blood_pressure?: string;
  temperature?: number;
  weight?: number;
  clinical_complaint?: string;
  created_at: string;
  status: string;
  patients: Patient;
}

const ReceptionReportsPage = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [hemoglobin, setHemoglobin] = useState('');
  const [wbc, setWbc] = useState('');
  const [platelets, setPlatelets] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [clinicalComplaint, setClinicalComplaint] = useState('');

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reports for Reception
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reception-reports', searchQuery],
    queryFn: async () => {
      // First get the reports
      let reportsQuery = supabase
        .from('patient_reports')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: reportsData, error: reportsError } = await reportsQuery;
      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
        throw reportsError;
      }

      if (!reportsData || reportsData.length === 0) return [];

      // Get patient IDs from reports
      const patientIds = reportsData.map(report => report.patient_id);

      // Fetch patients separately
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, patient_id, name, age, gender, phone_number')
        .in('id', patientIds);

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        throw patientsError;
      }

      // Combine reports with patient data
      const combinedData = reportsData.map(report => {
        const patient = patientsData?.find(p => p.id === report.patient_id);
        return {
          ...report,
          patients: patient || {
            id: '',
            patient_id: 0,
            name: 'Unknown',
            age: 0,
            gender: 'Unknown',
            phone_number: ''
          }
        };
      });

      // Apply search filter if needed
      if (searchQuery) {
        return combinedData.filter(report => 
          report.patients.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.patients.patient_id.toString().includes(searchQuery)
        );
      }

      return combinedData;
    }
  });

  const createReportMutation = useMutation({
    mutationFn: async (reportData: {
      patient_id: string;
      hemoglobin?: number;
      wbc?: number;
      platelets?: number;
      blood_pressure?: string;
      temperature?: number;
      weight?: number;
      clinical_complaint?: string;
    }) => {
      const { data, error } = await supabase
        .from('patient_reports')
        .insert({
          ...reportData,
          status: 'incomplete',
          created_by: user?.id,
          created_by_role: 'reception',
          reception_completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Report Created",
        description: "Medical vitals report created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['reception-reports'] });
      resetForm();
      setShowCreateForm(false);
    },
    onError: (error) => {
      console.error('Error creating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create report. Please try again."
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a patient."
      });
      return;
    }

    createReportMutation.mutate({
      patient_id: selectedPatient.id,
      hemoglobin: hemoglobin ? parseFloat(hemoglobin) : undefined,
      wbc: wbc ? parseInt(wbc) : undefined,
      platelets: platelets ? parseInt(platelets) : undefined,
      blood_pressure: bloodPressure || undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      clinical_complaint: clinicalComplaint || undefined
    });
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setHemoglobin('');
    setWbc('');
    setPlatelets('');
    setBloodPressure('');
    setTemperature('');
    setWeight('');
    setClinicalComplaint('');
  };

  const handleCancel = () => {
    resetForm();
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reception Reports</h1>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Report
          </Button>
        </div>

        <ReportsSearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {showCreateForm && (
          <ReceptionReportForm
            selectedPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
            hemoglobin={hemoglobin}
            setHemoglobin={setHemoglobin}
            wbc={wbc}
            setWbc={setWbc}
            platelets={platelets}
            setPlatelets={setPlatelets}
            bloodPressure={bloodPressure}
            setBloodPressure={setBloodPressure}
            temperature={temperature}
            setTemperature={setTemperature}
            weight={weight}
            setWeight={setWeight}
            clinicalComplaint={clinicalComplaint}
            setClinicalComplaint={setClinicalComplaint}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createReportMutation.isPending}
          />
        )}

        <ReportsTable 
          reports={reports}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ReceptionReportsPage;

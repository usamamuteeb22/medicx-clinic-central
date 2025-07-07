
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search } from 'lucide-react';
import PatientSelector from '@/components/PatientSelector';
import { format } from 'date-fns';

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

      if (searchQuery) {
        // For reception, we'll filter by patient after fetching
      }

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

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Create Report Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Medical Vitals Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <PatientSelector
                  selectedPatient={selectedPatient}
                  onPatientSelect={setSelectedPatient}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                    <Input
                      id="hemoglobin"
                      type="number"
                      step="0.1"
                      value={hemoglobin}
                      onChange={(e) => setHemoglobin(e.target.value)}
                      placeholder="e.g., 12.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wbc">WBC Count</Label>
                    <Input
                      id="wbc"
                      type="number"
                      value={wbc}
                      onChange={(e) => setWbc(e.target.value)}
                      placeholder="e.g., 7000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platelets">Platelets</Label>
                    <Input
                      id="platelets"
                      type="number"
                      value={platelets}
                      onChange={(e) => setPlatelets(e.target.value)}
                      placeholder="e.g., 250000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                    <Input
                      id="bloodPressure"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      placeholder="e.g., 120/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      placeholder="e.g., 98.6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g., 70.5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicalComplaint">Clinical Complaint</Label>
                  <textarea
                    id="clinicalComplaint"
                    value={clinicalComplaint}
                    onChange={(e) => setClinicalComplaint(e.target.value)}
                    placeholder="Describe patient's symptoms and complaints..."
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setShowCreateForm(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReportMutation.isPending}
                    className="flex-1"
                  >
                    {createReportMutation.isPending ? 'Creating...' : 'Create Report'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading reports...</div>
            ) : reports && reports.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-sm">
                          {report.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{report.patients.name}</div>
                            <div className="text-sm text-gray-500">
                              ID: {report.patients.patient_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={report.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {report.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reports found. Create your first report to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionReportsPage;

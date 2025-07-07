
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Search, FileText } from 'lucide-react';
import MedicinePrescriptionForm from '@/components/MedicinePrescriptionForm';
import ReportPDFGenerator from '@/components/ReportPDFGenerator';
import { format } from 'date-fns';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
}

interface DoctorPrescribedMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  morning: boolean;
  afternoon?: boolean;
  evening: boolean;
  night: boolean;
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
  medical_history?: string;
  observations?: string;
  recommendations?: string;
  created_at: string;
  status: string;
  patients: Patient;
}

const PatientReportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<PatientReport | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [prescribedMedicines, setPrescribedMedicines] = useState<DoctorPrescribedMedicine[]>([]);
  
  // Form state for doctor sections
  const [medicalHistory, setMedicalHistory] = useState('');
  const [observations, setObservations] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reports with search functionality
  const { data: reports, isLoading } = useQuery({
    queryKey: ['doctor-reports', searchQuery],
    queryFn: async () => {
      // First get the reports
      let reportsQuery = supabase
        .from('patient_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        const isReportId = searchQuery.length >= 8;
        if (isReportId) {
          reportsQuery = reportsQuery.ilike('id', `${searchQuery}%`);
        }
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

      // Apply patient search filter if needed
      if (searchQuery && searchQuery.length < 8) {
        return combinedData.filter(report => 
          report.patients.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.patients.patient_id.toString().includes(searchQuery)
        );
      }

      return combinedData;
    }
  });

  // Fetch prescribed medicines for selected report
  const { data: reportPrescriptions } = useQuery({
    queryKey: ['report-prescriptions', selectedReport?.id],
    queryFn: async () => {
      if (!selectedReport?.id) return [];
      
      const { data, error } = await supabase
        .from('medicine_prescriptions')
        .select(`
          id,
          quantity,
          morning,
          afternoon,
          evening,
          night,
          medicine_id
        `)
        .eq('patient_report_id', selectedReport.id);

      if (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
      }

      // Fetch medicine details separately
      if (!data || data.length === 0) return [];

      const medicineIds = data.map(item => item.medicine_id).filter(Boolean);
      if (medicineIds.length === 0) return [];

      const { data: medicines, error: medicineError } = await supabase
        .from('medicines')
        .select('id, name, category, total_quantity')
        .in('id', medicineIds);

      if (medicineError) {
        console.error('Error fetching medicines:', medicineError);
        throw medicineError;
      }

      // Combine prescription data with medicine details
      return data.map(prescription => {
        const medicine = medicines?.find(m => m.id === prescription.medicine_id);
        return {
          id: prescription.id,
          medicine: medicine || { id: '', name: 'Unknown', category: '', total_quantity: 0 },
          quantity: prescription.quantity,
          morning: prescription.morning,
          afternoon: prescription.afternoon,
          evening: prescription.evening,
          night: prescription.night
        };
      }) as DoctorPrescribedMedicine[];
    },
    enabled: !!selectedReport?.id
  });

  useEffect(() => {
    if (reportPrescriptions) {
      setPrescribedMedicines(reportPrescriptions);
    }
  }, [reportPrescriptions]);

  useEffect(() => {
    if (selectedReport) {
      setMedicalHistory(selectedReport.medical_history || '');
      setObservations(selectedReport.observations || '');
      setRecommendations(selectedReport.recommendations || '');
    }
  }, [selectedReport]);

  const updateReportMutation = useMutation({
    mutationFn: async (reportData: {
      medical_history?: string;
      observations?: string;
      recommendations?: string;
    }) => {
      if (!selectedReport) throw new Error('No report selected');

      const { data, error } = await supabase
        .from('patient_reports')
        .update({
          ...reportData,
          status: 'completed',
          doctor_completed_at: new Date().toISOString()
        })
        .eq('id', selectedReport.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Report Completed",
        description: "Patient report has been completed successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['doctor-reports'] });
      setShowReportForm(false);
      setSelectedReport(null);
    },
    onError: (error) => {
      console.error('Error updating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete report. Please try again."
      });
    }
  });

  const handleCompleteReport = (e: React.FormEvent) => {
    e.preventDefault();

    updateReportMutation.mutate({
      medical_history: medicalHistory,
      observations: observations,
      recommendations: recommendations
    });
  };

  const handleSelectReport = (report: PatientReport) => {
    setSelectedReport(report);
    setShowReportForm(true);
  };

  const handleGeneratePDF = () => {
    if (selectedReport && prescribedMedicines) {
      setShowPDFGenerator(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Reports</h1>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Report ID, Patient Name, or Patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Report Completion Form */}
        {showReportForm && selectedReport && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Complete Patient Report</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Patient Info (Read-only) */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><strong>Name:</strong> {selectedReport.patients.name}</div>
                  <div><strong>ID:</strong> {selectedReport.patients.patient_id}</div>
                  <div><strong>Age:</strong> {selectedReport.patients.age}</div>
                </div>
              </div>

              {/* Medical Vitals (Read-only) */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-3">Medical Vitals (Reception Input)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {selectedReport.hemoglobin && <div><strong>Hemoglobin:</strong> {selectedReport.hemoglobin} g/dL</div>}
                  {selectedReport.wbc && <div><strong>WBC:</strong> {selectedReport.wbc}</div>}
                  {selectedReport.platelets && <div><strong>Platelets:</strong> {selectedReport.platelets}</div>}
                  {selectedReport.blood_pressure && <div><strong>BP:</strong> {selectedReport.blood_pressure} mmHg</div>}
                  {selectedReport.temperature && <div><strong>Temperature:</strong> {selectedReport.temperature}°F</div>}
                  {selectedReport.weight && <div><strong>Weight:</strong> {selectedReport.weight} kg</div>}
                </div>
                {selectedReport.clinical_complaint && (
                  <div className="mt-3">
                    <strong>Clinical Complaint:</strong>
                    <p className="mt-1">{selectedReport.clinical_complaint}</p>
                  </div>
                )}
              </div>

              {/* Medicine Prescription Form */}
              <div className="mb-6">
                <MedicinePrescriptionForm
                  reportId={selectedReport.id}
                  prescribedMedicines={prescribedMedicines}
                  onPrescribedMedicinesChange={setPrescribedMedicines}
                />
              </div>

              {/* Doctor's Sections */}
              <form onSubmit={handleCompleteReport} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <textarea
                    id="medicalHistory"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="Enter patient's medical history..."
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Clinical Observations</Label>
                  <textarea
                    id="observations"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Enter your clinical observations..."
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <textarea
                    id="recommendations"
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="Enter your recommendations..."
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowReportForm(false);
                      setSelectedReport(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleGeneratePDF}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Preview Report
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateReportMutation.isPending}
                    className="flex-1"
                  >
                    {updateReportMutation.isPending ? 'Completing...' : 'Complete Report'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-xs sm:text-sm">
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
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSelectReport(report)}
                          >
                            {report.status === 'completed' ? 'View' : 'Complete'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reports found. {searchQuery ? 'Try a different search term.' : 'No reports available.'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PDF Generator */}
        {showPDFGenerator && selectedReport && (
          <ReportPDFGenerator
            reportId={selectedReport.id}
            patient={selectedReport.patients}
            reportData={{
              hemoglobin: selectedReport.hemoglobin?.toString() || '',
              wbc: selectedReport.wbc?.toString() || '',
              platelets: selectedReport.platelets?.toString() || '',
              blood_pressure: selectedReport.blood_pressure || '',
              temperature: selectedReport.temperature?.toString() || '',
              weight: selectedReport.weight?.toString() || '',
              clinical_complaint: selectedReport.clinical_complaint || '',
              medical_history: selectedReport.medical_history || '',
              observations: selectedReport.observations || '',
              recommendations: selectedReport.recommendations || ''
            }}
            prescribedMedicines={prescribedMedicines}
            onClose={() => setShowPDFGenerator(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PatientReportPage;

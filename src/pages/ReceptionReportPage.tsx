
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { FileText, Plus, User, Stethoscope, Eye } from 'lucide-react';
import ReceptionReportSearchBar from '@/components/reception/ReceptionReportSearchBar';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface ReceptionReport {
  id: string;
  patient_id: string;
  hemoglobin: number | null;
  wbc: number | null;
  platelets: number | null;
  blood_pressure: string | null;
  temperature: number | null;
  weight: number | null;
  clinical_complaint: string | null;
  created_at: string;
  created_by_role: string | null;
  patient: Patient;
}

const ReceptionReportPage = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    hemoglobin: '',
    wbc: '',
    platelets: '',
    blood_pressure: '',
    temperature: '',
    weight: '',
    clinical_complaint: ''
  });
  const [receptionReports, setReceptionReports] = useState<ReceptionReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReportDetails, setSelectedReportDetails] = useState<ReceptionReport | null>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);

  // Check user permissions - Reception and Admin only
  const canAccessPage = user?.role === 'admin' || user?.role === 'reception';

  if (!canAccessPage) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only Admin and Reception users can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchReceptionReports();
  }, []);

  const fetchReceptionReports = async () => {
    try {
      // Fetch reception reports from the patient_reports table filtered by reception role
      const { data: reportsData, error } = await supabase
        .from('patient_reports')
        .select('*')
        .eq('created_by_role', 'reception')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch patient data for each report
      const reportsWithPatients = await Promise.all(
        reportsData?.map(async (report) => {
          const { data: patientData } = await supabase
            .from('patients')
            .select('*')
            .eq('id', report.patient_id)
            .single();

          return {
            id: report.id,
            patient_id: report.patient_id,
            hemoglobin: report.hemoglobin,
            wbc: report.wbc,
            platelets: report.platelets,
            blood_pressure: report.blood_pressure,
            temperature: report.temperature,
            weight: report.weight,
            clinical_complaint: report.clinical_complaint,
            created_at: report.created_at,
            created_by_role: report.created_by_role,
            patient: patientData || {
              id: report.patient_id,
              patient_id: 0,
              name: 'Unknown Patient',
              age: 0,
              gender: 'unknown',
              phone_number: ''
            }
          };
        }) || []
      );

      setReceptionReports(reportsWithPatients);
    } catch (error) {
      console.error('Error fetching reception reports:', error);
    }
  };

  const handleSaveReport = async () => {
    if (!selectedPatient) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a patient first"
      });
      return;
    }

    setLoading(true);
    try {
      // Save to patient_reports table with reception role
      const { data: reportResult, error: reportError } = await supabase
        .from('patient_reports')
        .insert({
          patient_id: selectedPatient.id,
          hemoglobin: formData.hemoglobin ? parseFloat(formData.hemoglobin) : null,
          wbc: formData.wbc ? parseInt(formData.wbc) : null,
          platelets: formData.platelets ? parseInt(formData.platelets) : null,
          blood_pressure: formData.blood_pressure || null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          clinical_complaint: formData.clinical_complaint || null,
          created_by: user?.id,
          created_by_role: 'reception',
          status: 'reception_completed'
        })
        .select()
        .single();

      if (reportError) throw reportError;

      console.log('Reception report saved with ID:', reportResult.id);

      toast({
        title: "Success",
        description: `Reception report saved successfully!`
      });

      // Reset form and refresh reports
      resetForm();
      fetchReceptionReports();

    } catch (error: any) {
      console.error('Error saving report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save reception report"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setFormData({
      hemoglobin: '',
      wbc: '',
      platelets: '',
      blood_pressure: '',
      temperature: '',
      weight: '',
      clinical_complaint: ''
    });
  };

  const handleViewReportDetails = (report: ReceptionReport) => {
    setSelectedReportDetails(report);
    setShowReportDetails(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reception Report</h1>
          <p className="text-gray-600">Create reception reports for patients</p>
        </div>
        <Button 
          onClick={resetForm}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Report</span>
        </Button>
      </div>

      {/* Patient Selection */}
      <ReceptionReportSearchBar 
        selectedPatient={selectedPatient}
        onPatientSelect={setSelectedPatient}
      />

      {selectedPatient && (
        <>
          {/* Medical Vitals & Clinical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Medical Vitals & Clinical Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hemoglobin">Hemoglobin (HB)</Label>
                  <Input
                    id="hemoglobin"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 12.5"
                    value={formData.hemoglobin}
                    onChange={(e) => setFormData({...formData, hemoglobin: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wbc">WBC Count</Label>
                  <Input
                    id="wbc"
                    type="number"
                    placeholder="e.g., 7000"
                    value={formData.wbc}
                    onChange={(e) => setFormData({...formData, wbc: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platelets">Platelets</Label>
                  <Input
                    id="platelets"
                    type="number"
                    placeholder="e.g., 250000"
                    value={formData.platelets}
                    onChange={(e) => setFormData({...formData, platelets: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blood_pressure">Blood Pressure</Label>
                  <Input
                    id="blood_pressure"
                    placeholder="e.g., 120/80"
                    value={formData.blood_pressure}
                    onChange={(e) => setFormData({...formData, blood_pressure: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°F)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 98.6"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 70.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinical_complaint">Clinical Complaint</Label>
                <Textarea
                  id="clinical_complaint"
                  placeholder="Describe the patient's complaints and symptoms..."
                  value={formData.clinical_complaint}
                  onChange={(e) => setFormData({...formData, clinical_complaint: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleSaveReport}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save Reception Report'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reception Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Reception Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receptionReports.map((report) => (
                  <TableRow 
                    key={report.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewReportDetails(report)}
                  >
                    <TableCell className="font-medium">{report.id.slice(0, 8)}</TableCell>
                    <TableCell>{report.patient.name}</TableCell>
                    <TableCell>{report.patient.patient_id}</TableCell>
                    <TableCell>{formatDate(report.created_at)}</TableCell>
                    <TableCell>{report.patient.phone_number || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewReportDetails(report);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      {showReportDetails && selectedReportDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reception Report Details</h2>
              <Button
                variant="outline"
                onClick={() => setShowReportDetails(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Report ID</Label>
                  <p className="font-medium">{selectedReportDetails.id.slice(0, 8)}</p>
                </div>
                <div>
                  <Label>Patient Name</Label>
                  <p className="font-medium">{selectedReportDetails.patient.name}</p>
                </div>
                <div>
                  <Label>Patient ID</Label>
                  <p className="font-medium">{selectedReportDetails.patient.patient_id}</p>
                </div>
                <div>
                  <Label>Date/Time</Label>
                  <p className="font-medium">{formatDate(selectedReportDetails.created_at)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Hemoglobin</Label>
                  <p className="font-medium">{selectedReportDetails.hemoglobin || 'N/A'}</p>
                </div>
                <div>
                  <Label>WBC Count</Label>
                  <p className="font-medium">{selectedReportDetails.wbc || 'N/A'}</p>
                </div>
                <div>
                  <Label>Platelets</Label>
                  <p className="font-medium">{selectedReportDetails.platelets || 'N/A'}</p>
                </div>
                <div>
                  <Label>Blood Pressure</Label>
                  <p className="font-medium">{selectedReportDetails.blood_pressure || 'N/A'}</p>
                </div>
                <div>
                  <Label>Temperature</Label>
                  <p className="font-medium">{selectedReportDetails.temperature || 'N/A'}</p>
                </div>
                <div>
                  <Label>Weight</Label>
                  <p className="font-medium">{selectedReportDetails.weight || 'N/A'}</p>
                </div>
              </div>

              {selectedReportDetails.clinical_complaint && (
                <div>
                  <Label>Clinical Complaint</Label>
                  <p className="font-medium mt-1">{selectedReportDetails.clinical_complaint}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionReportPage;

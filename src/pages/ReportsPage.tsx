
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { FileText, Search } from 'lucide-react';
import ReportPDFGenerator from '@/components/ReportPDFGenerator';

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
  hemoglobin: number | null;
  wbc: number | null;
  platelets: number | null;
  blood_pressure: string | null;
  temperature: number | null;
  weight: number | null;
  clinical_complaint: string | null;
  medical_history: string | null;
  observations: string | null;
  recommendations: string | null;
  report_date: string;
  created_at: string;
  patient: Patient;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
}

interface PrescribedMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  morning: boolean;
  evening: boolean;
  night: boolean;
}

const ReportsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientReports, setPatientReports] = useState<PatientReport[]>([]);
  const [allLatestReports, setAllLatestReports] = useState<PatientReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<PatientReport | null>(null);
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);

  // Check user permissions - now includes reception
  const canAccessPage = useMemo(() => 
    user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'reception',
    [user?.role]
  );

  // Load all latest reports on component mount
  useEffect(() => {
    if (canAccessPage) {
      fetchAllLatestReports();
    }
  }, [canAccessPage]);

  // Search patients as user types
  useEffect(() => {
    if (searchTerm.trim()) {
      searchPatients();
    } else {
      setSearchResults([]);
      setSelectedPatient(null);
      setPatientReports([]);
    }
  }, [searchTerm]);

  // Load reports when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientReports();
    }
  }, [selectedPatient]);

  const searchPatients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,patient_id.eq.${parseInt(searchTerm) || 0},phone_number.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  }, [searchTerm]);

  const fetchPatientReports = useCallback(async () => {
    if (!selectedPatient) return;

    setLoading(true);
    try {
      const { data: reportsData, error } = await supabase
        .from('patient_reports')
        .select('*')
        .eq('patient_id', selectedPatient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include patient info
      const reportsWithPatient = reportsData?.map(report => ({
        ...report,
        patient: selectedPatient
      })) || [];

      setPatientReports(reportsWithPatient);
    } catch (error: any) {
      console.error('Error fetching patient reports:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch patient reports"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  const fetchAllLatestReports = useCallback(async () => {
    try {
      const { data: reportsData, error } = await supabase
        .from('patient_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Limit for performance

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
            ...report,
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

      setAllLatestReports(reportsWithPatients);
    } catch (error: any) {
      console.error('Error fetching latest reports:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch reports"
      });
    }
  }, []);

  const handleReportClick = useCallback(async (report: PatientReport) => {
    setSelectedReport(report);
    
    // Fetch prescribed medicines for this report
    try {
      const { data: prescriptionsData, error } = await supabase
        .from('medicine_prescriptions')
        .select('*')
        .eq('patient_report_id', report.id);

      if (error) throw error;

      // Fetch medicine details for each prescription
      const medicinesWithDetails = await Promise.all(
        prescriptionsData?.map(async (prescription) => {
          const { data: medicineData } = await supabase
            .from('medicines')
            .select('*')
            .eq('id', prescription.medicine_id)
            .single();

          return {
            ...prescription,
            medicine: medicineData || {
              id: prescription.medicine_id || '',
              name: 'Unknown Medicine',
              category: 'unknown',
              total_quantity: 0
            }
          };
        }) || []
      );

      setPrescribedMedicines(medicinesWithDetails);
      setShowPDFPreview(true);
    } catch (error: any) {
      console.error('Error fetching prescribed medicines:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report details"
      });
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  if (!canAccessPage) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only Admin, Doctor, and Reception users can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Reports</h1>
          <p className="text-gray-600">View and manage patient medical reports</p>
        </div>
      </div>

      {/* Patient Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Patient</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              placeholder="Search by Patient ID, Name, or Phone Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setSearchResults([]);
                      setSearchTerm(`${patient.name} (ID: ${patient.patient_id})`);
                    }}
                  >
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-500">
                      ID: {patient.patient_id} | Age: {patient.age} | Phone: {patient.phone_number}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Selected Patient</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-medium">Name:</span> {selectedPatient.name}</div>
                <div><span className="font-medium">ID:</span> {selectedPatient.patient_id}</div>
                <div><span className="font-medium">Age:</span> {selectedPatient.age}</div>
                <div><span className="font-medium">Phone:</span> {selectedPatient.phone_number}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Reports Cards */}
      {selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Reports for {selectedPatient.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading reports...</div>
            ) : patientReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reports found for this patient
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {patientReports.map((report) => (
                  <Card 
                    key={report.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleReportClick(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-sm">Medical Report</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatDate(report.created_at)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(report.created_at)}
                      </div>
                      {report.clinical_complaint && (
                        <div className="mt-2 text-xs text-gray-500 line-clamp-2">
                          {report.clinical_complaint.substring(0, 60)}...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Latest Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Latest Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allLatestReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  allLatestReports.map((report) => (
                    <TableRow 
                      key={report.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleReportClick(report)}
                    >
                      <TableCell className="font-medium">{report.patient.patient_id}</TableCell>
                      <TableCell>{report.patient.name}</TableCell>
                      <TableCell className="capitalize">{report.patient.gender}</TableCell>
                      <TableCell>{report.patient.phone_number || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <div>{formatDate(report.created_at)}</div>
                          <div className="text-sm text-gray-500">{formatTime(report.created_at)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReportClick(report);
                          }}
                        >
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview Modal */}
      {showPDFPreview && selectedReport && (
        <ReportPDFGenerator
          reportId={selectedReport.id}
          patient={selectedReport.patient}
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
          onClose={() => {
            setShowPDFPreview(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
};

export default ReportsPage;

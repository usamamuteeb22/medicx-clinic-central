
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Patient, PatientReport, FormData, PrescribedMedicine } from '@/types/reportTypes';

const ReportsPage = () => {
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredReports, setFilteredReports] = useState<PatientReport[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PatientReport | null>(null);
  const [reportFormData, setReportFormData] = useState<FormData>({
    blood_pressure: '',
    temperature: '',
    weight: '',
    bsr: '',
    saturation: '',
    clinical_complaint: '',
    medical_history: '',
    observations: '',
    recommendations: '',
    medicine_notes: '',
    test_advice: ''
  });
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports...');

      // First fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('patient_reports')
        .select('*')
        .eq('created_by_role', 'doctor')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Then fetch patients separately and join manually
      const reportIds = reportsData?.map(r => r.patient_id) || [];
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .in('id', reportIds);

      if (patientsError) throw patientsError;

      // Create a map for quick patient lookup
      const patientMap = new Map(patientsData?.map(p => [p.id, p]) || []);

      // Combine reports with patient data
      const reportsWithPatients: PatientReport[] = reportsData?.map(report => ({
        ...report,
        patient: patientMap.get(report.patient_id) || null
      })) || [];

      console.log('Reports data:', reportsWithPatients);
      setReports(reportsWithPatients);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch patient reports"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    // Apply search filter
    const filtered = reports.filter(report => {
      const searchTerm = search.toLowerCase();
      return (
        report.patient?.name?.toLowerCase().includes(searchTerm) ||
        report.patient?.patient_id?.toString().includes(searchTerm) ||
        report.blood_pressure?.toLowerCase().includes(searchTerm) ||
        report.clinical_complaint?.toLowerCase().includes(searchTerm)
      );
    });
    setFilteredReports(filtered);
  }, [search, reports]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleShowReport = async (report: PatientReport) => {
    try {
      console.log('Loading report details for:', report.id);
      setSelectedReport(report);
      
      // Format form data properly for the new schema
      const reportFormData: FormData = {
        blood_pressure: report.blood_pressure || '',
        temperature: report.temperature?.toString() || '',
        weight: report.weight?.toString() || '',
        bsr: report.bsr?.toString() || '',
        saturation: report.saturation?.toString() || '',
        clinical_complaint: report.clinical_complaint || '',
        medical_history: report.medical_history || '',
        observations: report.observations || '',
        recommendations: report.recommendations || '',
        medicine_notes: report.medicine_notes || '',
        test_advice: report.test_advice || ''
      };
      setReportFormData(reportFormData);

      // Load medicine prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('medicine_prescriptions')
        .select('*')
        .eq('patient_report_id', report.id);

      if (prescriptionsError) throw prescriptionsError;

      // Fetch medicines separately
      const medicineIds = prescriptionsData?.map(p => p.medicine_id) || [];
      const { data: medicinesData, error: medicinesError } = await supabase
        .from('medicines')
        .select('*')
        .in('id', medicineIds);

      if (medicinesError) throw medicinesError;

      // Create medicine map
      const medicineMap = new Map(medicinesData?.map(m => [m.id, m]) || []);

      const prescriptions: PrescribedMedicine[] = prescriptionsData?.map(p => {
        const medicine = medicineMap.get(p.medicine_id);
        return {
          id: p.id,
          medicine: medicine || { id: '', name: 'Unknown Medicine', category: '', total_quantity: 0 },
          quantity: p.quantity,
          days: p.days || 1,
          morning: p.morning || false,
          afternoon: p.afternoon || false,
          evening: p.evening || false,
          night: p.night || false,
          before_meal: p.before_meal || false,
          after_meal: p.after_meal || false,
          fasting: p.fasting || false,
        };
      }) || [];
      setPrescribedMedicines(prescriptions);

      setShowReportModal(true);
    } catch (error: any) {
      console.error('Error loading report details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report details"
      });
    }
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Patient Reports</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search by patient name, ID, or report details..."
            value={search}
            onChange={handleSearchChange}
          />
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            Loading reports...
          </CardContent>
        </Card>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map(report => (
            <Card key={report.id} className="bg-white shadow-md rounded-md overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {report.patient?.name || 'Unknown Patient'} (ID: {report.patient?.patient_id || 'N/A'})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-600">
                  Report Date: {new Date(report.created_at).toLocaleDateString()}
                </p>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => handleShowReport(report)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            No reports found.
          </CardContent>
        </Card>
      )}

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={handleCloseReportModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Report Details</DialogTitle>
            <DialogDescription>
              View the detailed information for this patient report.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Information</h3>
                <div className="space-y-2">
                  <div>
                    <Label>Name:</Label>
                    <p>{selectedReport.patient?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Patient ID:</Label>
                    <p>{selectedReport.patient?.patient_id || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Age:</Label>
                    <p>{selectedReport.patient?.age || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Gender:</Label>
                    <p>{selectedReport.patient?.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Report Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Details</h3>
                <div className="space-y-2">
                  <div>
                    <Label>Report Date:</Label>
                    <p>{new Date(selectedReport.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Blood Pressure:</Label>
                    <p>{selectedReport.blood_pressure || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Temperature:</Label>
                    <p>{selectedReport.temperature || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Weight:</Label>
                    <p>{selectedReport.weight || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>BSR:</Label>
                    <p>{selectedReport.bsr || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Saturation:</Label>
                    <p>{selectedReport.saturation || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Clinical Complaint:</Label>
                    <p>{selectedReport.clinical_complaint || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Medical History:</Label>
                    <p>{selectedReport.medical_history || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Observations:</Label>
                    <p>{selectedReport.observations || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Recommendations:</Label>
                    <p>{selectedReport.recommendations || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Medicine Notes:</Label>
                    <p>{selectedReport.medicine_notes || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Test Advice:</Label>
                    <p>{selectedReport.test_advice || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Prescribed Medicines */}
              <div className="col-span-2">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Prescribed Medicines</h3>
                {prescribedMedicines.length > 0 ? (
                  <table className="min-w-full leading-normal">
                    <thead>
                      <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Medicine Name
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Days
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Dosage
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Meal Timing
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescribedMedicines.map(medicine => (
                        <tr key={medicine.id}>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {medicine.medicine.name}
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {medicine.quantity}
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {medicine.days}
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {[
                              medicine.morning && 'Morning',
                              medicine.afternoon && 'Afternoon',
                              medicine.evening && 'Evening',
                              medicine.night && 'Night'
                            ].filter(Boolean).join(', ') || 'Not specified'}
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {[
                              medicine.before_meal && 'Before Meal',
                              medicine.after_meal && 'After Meal',
                              medicine.fasting && 'Fasting'
                            ].filter(Boolean).join(', ') || 'Not specified'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No medicines prescribed for this report.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;

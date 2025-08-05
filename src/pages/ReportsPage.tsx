
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Calendar, User, Phone, FileText, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Patient, PatientReport, FormData, PrescribedMedicine } from '@/types/reportTypes';
import ReportPrintStyles from '@/components/report/ReportPrintStyles';
import ReportHeader from '@/components/report/ReportHeader';
import ReportPatientInfo from '@/components/report/ReportPatientInfo';
import ReportVitals from '@/components/report/ReportVitals';
import ReportMedicineTable from '@/components/report/ReportMedicineTable';
import ReportMedicalHistory from '@/components/report/ReportMedicalHistory';
import ReportFooter from '@/components/report/ReportFooter';
import PrintNotesSection from '@/components/report/PrintNotesSection';

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
    patient_history: ''
  });
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports...');

      // First fetch reports with doctor completion
      const { data: reportsData, error: reportsError } = await supabase
        .from('patient_reports')
        .select('*')
        .not('created_by_role', 'is', null)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Then fetch patients separately and join manually
      const patientIds = [...new Set(reportsData?.map(r => r.patient_id) || [])];
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      // Create a map for quick patient lookup
      const patientMap = new Map(patientsData?.map(p => [p.id, p]) || []);

      // Combine reports with patient data
      const reportsWithPatients: PatientReport[] = reportsData?.map(report => ({
        ...report,
        patient: patientMap.get(report.patient_id) || undefined
      })).filter(report => report.patient) || [];

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
    // Apply search filter with enhanced search criteria
    const filtered = reports.filter(report => {
      const searchTerm = search.toLowerCase();
      return (
        report.patient?.name?.toLowerCase().includes(searchTerm) ||
        report.patient?.patient_id?.toString().includes(searchTerm) ||
        report.patient?.phone_number?.toLowerCase().includes(searchTerm) ||
        report.patient?.cnic?.toLowerCase().includes(searchTerm) ||
        report.patient?.age?.toString().includes(searchTerm) ||
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
        patient_history: report.patient_history || ''
      };
      setReportFormData(reportFormData);

      // Load medicine prescriptions with notes
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
          note: p.note || undefined
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

  const handlePrint = () => {
    const printContent = document.getElementById('medical-report-print');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Medical Report - ${selectedReport?.patient?.name}</title>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { dateStr, timeStr };
  };

  // Create a no-op function for the onFormDataChange prop since this is read-only
  const handleFormDataChange = () => {
    // No-op for read-only view
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Reports</h1>
            <p className="text-gray-600">View and manage all patient medical reports</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Total Reports</div>
            <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-gray-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-lg">Search Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by patient name, age, CNIC, phone number, or report details..."
                value={search}
                onChange={handleSearchChange}
                className="pl-12 py-3 text-base border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
              />
            </div>
            {search && (
              <div className="mt-3 text-sm text-gray-600">
                Found {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} matching "{search}"
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading reports...</p>
            </div>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReports.map(report => {
              const { dateStr, timeStr } = formatDateTime(report.created_at);
              return (
                <Card key={report.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white rounded-xl overflow-hidden cursor-pointer transform hover:-translate-y-1">
                  <CardHeader className="pb-3 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {report.patient?.name || 'Unknown Patient'}
                          </CardTitle>
                          <div className="text-sm text-gray-500">ID: {report.patient?.patient_id || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dateStr}</div>
                          <div className="text-xs text-gray-500">{timeStr}</div>
                        </div>
                      </div>
                      
                      {report.patient?.phone_number && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <div className="text-sm text-gray-600">{report.patient.phone_number}</div>
                        </div>
                      )}

                      {report.patient?.age && (
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <div className="text-sm text-gray-600">Age: {report.patient.age}</div>
                        </div>
                      )}

                      {report.clinical_complaint && (
                        <div className="flex items-start space-x-3">
                          <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div className="text-sm text-gray-600 line-clamp-2">{report.clinical_complaint}</div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <Button 
                        onClick={() => handleShowReport(report)} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Report</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-lg border-0">
            <CardContent className="text-center py-16">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">
                {search ? `No reports match your search for "${search}"` : 'No patient reports available yet.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Report Preview Modal */}
        <Dialog open={showReportModal} onOpenChange={handleCloseReportModal}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-4">
            <DialogHeader>
              <div className="flex items-center justify-between mb-6">
                <DialogTitle className="text-2xl font-semibold text-gray-900">
                  Medical Report Preview
                </DialogTitle>
                <div className="flex items-center space-x-3">
                  <Button onClick={handlePrint} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
                    <Printer className="h-4 w-4" />
                    <span>Print Report</span>
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {selectedReport && (
              <div id="medical-report-print" className="bg-white">
                <ReportPrintStyles />
                <div className="report-container">
                  <ReportHeader 
                    reportId={selectedReport.id}
                    currentDate={new Date().toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                    currentTime={new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  />

                  <div className="content">
                    <ReportPatientInfo patient={selectedReport.patient!} />
                    <ReportVitals 
                      formData={reportFormData} 
                      onFormDataChange={handleFormDataChange}
                    />
                    <ReportMedicineTable prescribedMedicines={prescribedMedicines} />
                    <PrintNotesSection />
                    <ReportMedicalHistory 
                      formData={reportFormData} 
                      onFormDataChange={handleFormDataChange}
                    />
                  </div>

                  <ReportFooter />
                </div>
              </div>
            )}

            {/* Patient History Preview (only visible in preview, not print) */}
            {reportFormData.patient_history && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg print:hidden">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Patient History (Preview Only)</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{reportFormData.patient_history}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ReportsPage;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, FileText, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { PatientReport, PrescribedMedicine } from '@/types/reportTypes';
import { supabase } from '@/integrations/supabase/client';
import ReportPrintStyles from '@/components/report/ReportPrintStyles';
import ReportHeader from '@/components/report/ReportHeader';
import ReportPatientInfo from '@/components/report/ReportPatientInfo';
import ReportVitals from '@/components/report/ReportVitals';
import ReportMedicineTable from '@/components/report/ReportMedicineTable';
import ReportMedicalHistory from '@/components/report/ReportMedicalHistory';
import ReportFooter from '@/components/report/ReportFooter';
import PrintNotesSection from '@/components/report/PrintNotesSection';
import ReportsSearchSection from '@/components/reports/ReportsSearchSection';

const ReportsPage = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockDays, setStockDays] = useState('');
  const [selectedReport, setSelectedReport] = useState<PatientReport | null>(null);
  const [reportFormData, setReportFormData] = useState({
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

  const handleShowReport = async (report: PatientReport) => {
    try {
      console.log('Loading report details for:', report.id);
      setSelectedReport(report);
      
      // Format form data properly for the new schema
      const reportFormData = {
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

  // Create a no-op function for the onFormDataChange prop since this is read-only
  const handleFormDataChange = () => {
    // No-op for read-only view
  };

  const handleStockDeduction = async () => {
    if (!selectedReport || !stockDays || parseInt(stockDays) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid number of days"
      });
      return;
    }

    try {
      const days = parseInt(stockDays);
      
      // Process each prescribed medicine
      for (const prescription of prescribedMedicines) {
        const dailyDosage = (prescription.morning ? 1 : 0) + 
                           (prescription.afternoon ? 1 : 0) + 
                           (prescription.evening ? 1 : 0) + 
                           (prescription.night ? 1 : 0);
        
        const totalDeduction = dailyDosage * days;
        
        if (totalDeduction > 0) {
          // Insert stock history record
          const { error: stockError } = await supabase
            .from('medicine_stock_history')
            .insert({
              medicine_id: prescription.medicine.id,
              stock_type: 'remove',
              quantity: totalDeduction,
              created_by: selectedReport.created_by
            });
          
          if (stockError) throw stockError;
        }
      }

      toast({
        title: "Stock Updated",
        description: `Medicine stock deducted for ${days} days successfully`
      });
      
      setShowStockModal(false);
      setStockDays('');
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stock. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Patient Reports
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search and preview patient medical reports with advanced filtering capabilities
          </p>
        </div>

        {/* Enhanced Search Section */}
        <ReportsSearchSection onReportSelect={handleShowReport} />

        {/* Report Preview Modal */}
        <Dialog open={showReportModal} onOpenChange={handleCloseReportModal}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-4">
            <DialogHeader>
              <div className="flex items-center justify-between mb-6">
                <DialogTitle className="text-2xl font-semibold text-gray-900">
                  Medical Report Preview
                </DialogTitle>
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={() => setShowStockModal(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                    disabled={prescribedMedicines.length === 0}
                  >
                    <Package className="h-4 w-4" />
                    <span>Stock</span>
                  </Button>
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
                    reportNumber={selectedReport.report_number}
                    currentDate={new Date(selectedReport.created_at).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                    currentTime={new Date(selectedReport.created_at).toLocaleTimeString('en-US', {
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

        {/* Stock Deduction Modal */}
        <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Automatic Stock Deduction
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="stock-days">Number of Days</Label>
                <Input
                  id="stock-days"
                  type="number"
                  min="1"
                  placeholder="Enter number of days..."
                  value={stockDays}
                  onChange={(e) => setStockDays(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Stock will be deducted based on daily medicine usage × days
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowStockModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStockDeduction}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ReportsPage;

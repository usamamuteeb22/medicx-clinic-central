
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { FileText, Plus, User, Stethoscope, Pill, Printer } from 'lucide-react';
import PatientSelector from '@/components/PatientSelector';
import MedicinePrescriptionForm from '@/components/MedicinePrescriptionForm';
import ReportPDFGenerator from '@/components/ReportPDFGenerator';
import PatientReportSearchBar from '@/components/reception/PatientReportSearchBar';
import ReportVitals from '@/components/report/ReportVitals';
import ReportMedicalHistory from '@/components/report/ReportMedicalHistory';

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

interface PrescribedMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

interface ReceptionReport {
  id: string;
  report_id: number;
  patient_id: string;
  created_at: string;
  patient: Patient;
}

const PatientReportPage = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    hemoglobin: '',
    wbc: '',
    platelets: '',
    blood_pressure: '',
    temperature: '',
    weight: '',
    clinical_complaint: '',
    medical_history: '',
    observations: '',
    recommendations: ''
  });
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);

  // Check user permissions
  const canAccessPage = useMemo(() => 
    user?.role === 'admin' || user?.role === 'doctor', 
    [user?.role]
  );

  const handleSaveReport = useCallback(async () => {
    if (!selectedPatient) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a patient first"
      });
      return;
    }

    if (prescribedMedicines.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one medicine prescription"
      });
      return;
    }

    setLoading(true);
    try {
      // Create patient report
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
          medical_history: formData.medical_history || null,
          observations: formData.observations || null,
          recommendations: formData.recommendations || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Create medicine prescriptions
      const prescriptionPromises = prescribedMedicines.map(med => 
        supabase
          .from('medicine_prescriptions')
          .insert({
            patient_report_id: reportResult.id,
            medicine_id: med.medicine.id,
            quantity: med.quantity,
            morning: med.morning,
            afternoon: med.afternoon,
            evening: med.evening,
            night: med.night
          })
      );

      await Promise.all(prescriptionPromises);

      setSavedReportId(reportResult.id);
      toast({
        title: "Success",
        description: "Patient report saved successfully!"
      });

      // Show PDF preview
      setShowPDFPreview(true);

    } catch (error: any) {
      console.error('Error saving report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save patient report"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPatient, prescribedMedicines, formData, user?.id]);

  const handleReceptionReportSelect = useCallback(async (report: ReceptionReport) => {
    try {
      // Fetch the reception report details and pre-fill the form
      const { data: receptionReportData, error } = await supabase
        .from('patient_reports')
        .select('*')
        .eq('id', report.id)
        .single();

      if (error) throw error;

      // Set the patient
      setSelectedPatient(report.patient);

      // Pre-fill the medical vitals from reception report
      setFormData(prev => ({
        ...prev,
        hemoglobin: receptionReportData.hemoglobin?.toString() || '',
        wbc: receptionReportData.wbc?.toString() || '',
        platelets: receptionReportData.platelets?.toString() || '',
        blood_pressure: receptionReportData.blood_pressure || '',
        temperature: receptionReportData.temperature?.toString() || '',
        weight: receptionReportData.weight?.toString() || '',
        clinical_complaint: receptionReportData.clinical_complaint || ''
      }));

      toast({
        title: "Reception Report Loaded",
        description: "Medical vitals and clinical details have been pre-filled from the reception report."
      });

    } catch (error: any) {
      console.error('Error loading reception report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load reception report details"
      });
    }
  }, []);

  const resetForm = useCallback(() => {
    setSelectedPatient(null);
    setFormData({
      hemoglobin: '',
      wbc: '',
      platelets: '',
      blood_pressure: '',
      temperature: '',
      weight: '',
      clinical_complaint: '',
      medical_history: '',
      observations: '',
      recommendations: ''
    });
    setPrescribedMedicines([]);
    setSavedReportId(null);
    setShowPDFPreview(false);
  }, []);

  if (!canAccessPage) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only Admin and Doctor users can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Report & Prescription</h1>
          <p className="text-gray-600">Create medical reports and prescribe medicines</p>
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

      {/* Enhanced Search for Reception Reports */}
      <PatientReportSearchBar onReportSelect={handleReceptionReportSelect} />

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Select Patient</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PatientSelector 
            selectedPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
          />
        </CardContent>
      </Card>

      {selectedPatient && (
        <>
          {/* Medical Vitals */}
          <ReportVitals
            formData={formData}
            onFormDataChange={setFormData}
          />

          {/* Medicine Prescription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5" />
                <span>Medicine Prescription</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MedicinePrescriptionForm
                prescribedMedicines={prescribedMedicines}
                onPrescribedMedicinesChange={setPrescribedMedicines}
              />
            </CardContent>
          </Card>

          {/* Medical History & Notes */}
          <ReportMedicalHistory
            formData={formData}
            onFormDataChange={setFormData}
          />

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
                  <span>{loading ? 'Saving...' : 'Save & Generate Report'}</span>
                </Button>
                {savedReportId && (
                  <Button
                    onClick={() => setShowPDFPreview(true)}
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
        </>
      )}

      {/* PDF Preview Modal */}
      {showPDFPreview && savedReportId && selectedPatient && (
        <ReportPDFGenerator
          reportId={savedReportId}
          patient={selectedPatient}
          reportData={formData}
          prescribedMedicines={prescribedMedicines}
          onClose={() => setShowPDFPreview(false)}
        />
      )}
    </div>
  );
};

export default PatientReportPage;

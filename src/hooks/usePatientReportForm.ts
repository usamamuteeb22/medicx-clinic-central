
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  days: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  before_meal: boolean;
  after_meal: boolean;
  fasting: boolean;
  note?: string;
}

interface ReceptionReport {
  id: string;
  report_id: number;
  patient_id: string;
  created_at: string;
  patient: Patient;
}

export const usePatientReportForm = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
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
  const [loading, setLoading] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);

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
          bsr: formData.bsr ? parseFloat(formData.bsr) : null,
          saturation: formData.saturation ? parseFloat(formData.saturation) : null,
          blood_pressure: formData.blood_pressure || null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          medical_history: formData.medical_history || null,
          observations: formData.observations || null,
          recommendations: formData.recommendations || null,
          patient_history: formData.patient_history || null,
          created_by: user?.id,
          created_by_role: 'doctor'
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
            days: med.days,
            morning: med.morning,
            afternoon: med.afternoon,
            evening: med.evening,
            night: med.night,
            before_meal: med.before_meal,
            after_meal: med.after_meal,
            fasting: med.fasting,
            note: med.note
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
        bsr: receptionReportData.bsr?.toString() || '',
        saturation: receptionReportData.saturation?.toString() || '',
        blood_pressure: receptionReportData.blood_pressure || '',
        temperature: receptionReportData.temperature?.toString() || '',
        weight: receptionReportData.weight?.toString() || ''
      }));

      toast({
        title: "Reception Report Loaded",
        description: "Medical vitals have been pre-filled from the reception report."
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
    setPrescribedMedicines([]);
    setSavedReportId(null);
    setShowPDFPreview(false);
  }, []);

  return {
    selectedPatient,
    setSelectedPatient,
    formData,
    setFormData,
    prescribedMedicines,
    setPrescribedMedicines,
    loading,
    showPDFPreview,
    setShowPDFPreview,
    savedReportId,
    handleSaveReport,
    handleReceptionReportSelect,
    resetForm
  };
};

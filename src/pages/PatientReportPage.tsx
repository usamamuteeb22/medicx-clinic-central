
import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import PatientReportSearchBar from '@/components/reception/PatientReportSearchBar';
import ReportPDFGenerator from '@/components/ReportPDFGenerator';
import PatientReportHeader from '@/components/report/PatientReportHeader';
import PatientSelection from '@/components/report/PatientSelection';
import ReportVitals from '@/components/report/ReportVitals';
import MedicinePrescriptionSection from '@/components/report/MedicinePrescriptionSection';
import ReportMedicalHistory from '@/components/report/ReportMedicalHistory';
import ReportActionButtons from '@/components/report/ReportActionButtons';
import { usePatientReportForm } from '@/hooks/usePatientReportForm';

const PatientReportPage = () => {
  const { user } = useAuth();
  const {
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
  } = usePatientReportForm();

  // Check user permissions
  const canAccessPage = useMemo(() => 
    user?.role === 'admin' || user?.role === 'doctor', 
    [user?.role]
  );

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
      <PatientReportHeader onNewReport={resetForm} />

      {/* Enhanced Search for Reception Reports */}
      <PatientReportSearchBar onReportSelect={handleReceptionReportSelect} />

      {/* Patient Selection */}
      <PatientSelection 
        selectedPatient={selectedPatient}
        onPatientSelect={setSelectedPatient}
      />

      {selectedPatient && (
        <>
          {/* Medical Vitals */}
          <ReportVitals
            formData={formData}
            onFormDataChange={setFormData}
          />

          {/* Medicine Prescription */}
          <MedicinePrescriptionSection
            prescribedMedicines={prescribedMedicines}
            onPrescribedMedicinesChange={setPrescribedMedicines}
          />

          {/* Medical History & Notes */}
          <ReportMedicalHistory
            formData={formData}
            onFormDataChange={setFormData}
          />

          {/* Action Buttons */}
          <ReportActionButtons
            loading={loading}
            savedReportId={savedReportId}
            onSaveReport={handleSaveReport}
            onViewPDF={() => setShowPDFPreview(true)}
          />
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

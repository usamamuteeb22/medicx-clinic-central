
import React from 'react';
import BasePrintStyles from './styles/BasePrintStyles';
import PatientInfoPrintStyles from './styles/PatientInfoPrintStyles';
import VitalsPrintStyles from './styles/VitalsPrintStyles';
import MedicalHistoryPrintStyles from './styles/MedicalHistoryPrintStyles';
import MedicinePrintStyles from './styles/MedicinePrintStyles';
import NotesPrintStyles from './styles/NotesPrintStyles';

const ReportPrintStyles = () => {
  return (
    <>
      <BasePrintStyles />
      <PatientInfoPrintStyles />
      <VitalsPrintStyles />
      <MedicalHistoryPrintStyles />
      <MedicinePrintStyles />
      <NotesPrintStyles />
    </>
  );
};

export default ReportPrintStyles;

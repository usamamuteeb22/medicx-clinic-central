
import React, { useState } from 'react';
import PatientRegistrationForm from '@/components/patients/PatientRegistrationForm';
import PatientSearchSection from '@/components/patients/PatientSearchSection';

const AddPatientPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePatientAdded = () => {
    // Trigger refresh of the patients list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <PatientRegistrationForm onPatientAdded={handlePatientAdded} />
      <PatientSearchSection refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default AddPatientPage;

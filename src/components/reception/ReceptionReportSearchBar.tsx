import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface ReceptionReportSearchBarProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient) => void;
}

const ReceptionReportSearchBar: React.FC<ReceptionReportSearchBarProps> = ({
  selectedPatient,
  onPatientSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchPatients();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchPatients = async () => {
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
  };

  return (
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
                    onPatientSelect(patient);
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
  );
};

export default ReceptionReportSearchBar;
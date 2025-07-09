
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import PatientSearchFilters from './PatientSearchFilters';
import PatientsTable from './PatientsTable';
import { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

interface SearchFilters {
  id: string;
  name: string;
  phone: string;
  category: string;
}

interface PatientSearchSectionProps {
  refreshTrigger: number;
}

const PatientSearchSection: React.FC<PatientSearchSectionProps> = ({ refreshTrigger }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    id: '',
    name: '',
    phone: '',
    category: ''
  });

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('patient_id', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch patients"
      });
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesId = searchFilters.id === '' || 
      patient.patient_id.toString().includes(searchFilters.id);
    const matchesName = searchFilters.name === '' || 
      patient.name.toLowerCase().includes(searchFilters.name.toLowerCase());
    const matchesPhone = searchFilters.phone === '' || 
      (patient.phone_number && patient.phone_number.includes(searchFilters.phone));
    const matchesCategory = searchFilters.category === '' || 
      (patient.category && patient.category.toLowerCase().includes(searchFilters.category.toLowerCase()));
    
    return matchesId && matchesName && matchesPhone && matchesCategory;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search Patients</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <PatientSearchFilters 
            searchFilters={searchFilters}
            onFiltersChange={setSearchFilters}
          />
          <PatientsTable patients={filteredPatients} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientSearchSection;

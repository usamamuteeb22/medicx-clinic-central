
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Search, Download, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generatePatientsExcel } from '@/utils/patientsExcelUtils';
import { generatePatientsPDF } from '@/utils/patientsPdfUtils';
import { Tables } from '@/integrations/supabase/types';
import PatientSearchFilters from '@/components/patients/PatientSearchFilters';
import PatientsTable from '@/components/patients/PatientsTable';

type Patient = Tables<'patients'>;

interface SearchFilters {
  id: string;
  name: string;
  phone: string;
  category: string;
}

const PatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    id: '',
    name: '',
    phone: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      console.log('Fetching patients...');
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('patient_id', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }
      
      console.log('Patients fetched:', data);
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch patients"
      });
    } finally {
      setLoading(false);
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
      searchFilters.category === 'all' ||
      patient.category === searchFilters.category;
    
    return matchesId && matchesName && matchesPhone && matchesCategory;
  });

  const handleDownloadExcel = () => {
    generatePatientsExcel(filteredPatients);
  };

  const handleDownloadPDF = () => {
    generatePatientsPDF(filteredPatients);
  };

  const handleEditPatient = (patientId: string) => {
    navigate(`/patient/${patientId}/edit`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
        <div className="flex space-x-2">
          <Button onClick={handleDownloadExcel} variant="outline" className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700">
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search and Filter Patients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <PatientSearchFilters 
              searchFilters={searchFilters}
              onFiltersChange={setSearchFilters}
            />
            
            <PatientsTable 
              patients={filteredPatients}
              onEdit={handleEditPatient}
            />

            <div className="text-sm text-gray-500 mt-4">
              Showing {filteredPatients.length} of {patients.length} patients
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsPage;

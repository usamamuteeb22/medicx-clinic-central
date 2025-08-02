
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Search, Download, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generatePatientsExcel } from '@/utils/patientsExcelUtils';
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

interface DateFilters {
  startDate: string;
  endDate: string;
}

const PatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    id: '',
    name: '',
    phone: '',
    category: 'all'
  });
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching patients...');
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('patient_id', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }
      
      console.log('Patients fetched successfully:', data?.length || 0, 'records');
      setPatients(data || []);
    } catch (error: any) {
      console.error('Error in fetchPatients:', error);
      setError(error.message || 'Failed to fetch patients');
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch patients"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    if (!patient) return false;
    
    // Search filters
    const matchesId = !searchFilters.id || 
      patient.patient_id?.toString().includes(searchFilters.id);
    const matchesName = !searchFilters.name || 
      patient.name?.toLowerCase().includes(searchFilters.name.toLowerCase());
    const matchesPhone = !searchFilters.phone || 
      (patient.phone_number && patient.phone_number.includes(searchFilters.phone));
    const matchesCategory = !searchFilters.category || 
      searchFilters.category === 'all' ||
      (patient.category && patient.category.toLowerCase() === searchFilters.category.toLowerCase());
    
    // Date filters
    let matchesDateRange = true;
    if (dateFilters.startDate || dateFilters.endDate) {
      const registrationDate = patient.registration_date ? new Date(patient.registration_date) : null;
      if (registrationDate) {
        const startDate = dateFilters.startDate ? new Date(dateFilters.startDate) : null;
        const endDate = dateFilters.endDate ? new Date(dateFilters.endDate) : null;
        
        if (startDate && registrationDate < startDate) {
          matchesDateRange = false;
        }
        if (endDate && registrationDate > new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1)) {
          matchesDateRange = false;
        }
      } else if (dateFilters.startDate || dateFilters.endDate) {
        // If date filters are set but patient has no registration date, exclude
        matchesDateRange = false;
      }
    }
    
    return matchesId && matchesName && matchesPhone && matchesCategory && matchesDateRange;
  });

  const handleDownloadExcel = () => {
    try {
      generatePatientsExcel(filteredPatients);
      toast({
        title: "Success",
        description: `Excel file downloaded with ${filteredPatients.length} filtered patients`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate Excel file"
      });
    }
  };

  const handleEditPatient = (patientId: string) => {
    navigate(`/patient/${patientId}/edit`);
  };

  const clearDateFilters = () => {
    setDateFilters({
      startDate: '',
      endDate: ''
    });
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Patients</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchPatients}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={handleDownloadExcel} 
            variant="outline" 
            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Excel ({filteredPatients.length} patients)
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Date Range Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateFilters.startDate}
                onChange={(e) => setDateFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateFilters.endDate}
                onChange={(e) => setDateFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Button 
                onClick={clearDateFilters} 
                variant="outline"
                className="w-full"
              >
                Clear Dates
              </Button>
            </div>
          </div>
          {(dateFilters.startDate || dateFilters.endDate) && (
            <div className="mt-3 text-sm text-blue-600">
              Filtering by registration date: {dateFilters.startDate || 'Any'} to {dateFilters.endDate || 'Any'}
            </div>
          )}
        </CardContent>
      </Card>

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
              {(dateFilters.startDate || dateFilters.endDate) && " (filtered by date range)"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsPage;

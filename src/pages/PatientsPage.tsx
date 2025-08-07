
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
import PatientsPagination from '@/components/patients/PatientsPagination';

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

const PATIENTS_PER_PAGE = 50;

const PatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
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
  }, [currentPage, searchFilters, dateFilters]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching patients...');
      
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .order('patient_id', { ascending: false });

      // Apply search filters
      if (searchFilters.id) {
        query = query.eq('patient_id', parseInt(searchFilters.id));
      }
      if (searchFilters.name) {
        query = query.ilike('name', `%${searchFilters.name}%`);
      }
      if (searchFilters.phone) {
        query = query.ilike('phone_number', `%${searchFilters.phone}%`);
      }
      if (searchFilters.category && searchFilters.category !== 'all') {
        query = query.eq('category', searchFilters.category);
      }

      // Apply date filters
      if (dateFilters.startDate) {
        query = query.gte('registration_date', dateFilters.startDate);
      }
      if (dateFilters.endDate) {
        query = query.lte('registration_date', dateFilters.endDate);
      }

      // Apply pagination
      const from = (currentPage - 1) * PATIENTS_PER_PAGE;
      const to = from + PATIENTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }
      
      console.log('Patients fetched successfully:', data?.length || 0, 'records');
      setPatients(data || []);
      setTotalPatients(count || 0);
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

  const handleDownloadExcel = async () => {
    try {
      // Fetch all patients for export (not just current page)
      let query = supabase
        .from('patients')
        .select('*')
        .order('patient_id', { ascending: false });

      // Apply same filters for export
      if (searchFilters.id) {
        query = query.eq('patient_id', parseInt(searchFilters.id));
      }
      if (searchFilters.name) {
        query = query.ilike('name', `%${searchFilters.name}%`);
      }
      if (searchFilters.phone) {
        query = query.ilike('phone_number', `%${searchFilters.phone}%`);
      }
      if (searchFilters.category && searchFilters.category !== 'all') {
        query = query.eq('category', searchFilters.category);
      }

      if (dateFilters.startDate) {
        query = query.gte('registration_date', dateFilters.startDate);
      }
      if (dateFilters.endDate) {
        query = query.lte('registration_date', dateFilters.endDate);
      }

      const { data: allPatients, error } = await query;
      
      if (error) throw error;

      generatePatientsExcel(allPatients || []);
      toast({
        title: "Success",
        description: `Excel file downloaded with ${allPatients?.length || 0} patients`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate Excel file"
      });
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Patient deleted successfully"
      });
      
      fetchPatients();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete patient"
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
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setSearchFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const totalPages = Math.ceil(totalPatients / PATIENTS_PER_PAGE);

  if (loading && patients.length === 0) {
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
            Download Excel ({totalPatients} patients)
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
              onFiltersChange={handleFiltersChange}
            />
            
            <PatientsTable 
              patients={patients}
              onDeletePatient={handleDeletePatient}
            />

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * PATIENTS_PER_PAGE) + 1} to {Math.min(currentPage * PATIENTS_PER_PAGE, totalPatients)} of {totalPatients} patients
                {(dateFilters.startDate || dateFilters.endDate) && " (filtered by date range)"}
              </div>
              
              <PatientsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsPage;

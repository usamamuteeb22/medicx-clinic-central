
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Search, Download, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generatePatientsExcel } from '@/utils/patientsExcelUtils';
import { generatePatientsPDF } from '@/utils/patientsPdfUtils';
import { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

const PatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchFilters, setSearchFilters] = useState({
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
        <div className="text-center">Loading patients...</div>
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
            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search by ID</Label>
                <Input
                  placeholder="Patient ID"
                  value={searchFilters.id}
                  onChange={(e) => setSearchFilters({...searchFilters, id: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Search by Name</Label>
                <Input
                  placeholder="Patient Name"
                  value={searchFilters.name}
                  onChange={(e) => setSearchFilters({...searchFilters, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Search by Phone</Label>
                <Input
                  placeholder="Phone Number"
                  value={searchFilters.phone}
                  onChange={(e) => setSearchFilters({...searchFilters, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Filter by Category</Label>
                <Select value={searchFilters.category} onValueChange={(value) => setSearchFilters({...searchFilters, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Thalassemic">Thalassemic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Patients Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>{patient.patient_id}</TableCell>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.category === 'Paid' 
                              ? 'bg-green-100 text-green-800'
                              : patient.category === 'Free'
                              ? 'bg-blue-100 text-blue-800'
                              : patient.category === 'Thalassemic'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.category || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>{patient.phone_number || 'N/A'}</TableCell>
                        <TableCell>{patient.address || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(patient.registration_date || '').toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPatient(patient.id)}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

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

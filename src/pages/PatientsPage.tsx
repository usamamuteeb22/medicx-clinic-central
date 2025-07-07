
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Download, User } from 'lucide-react';
import { generatePatientsExcel } from '@/utils/patientsExcelUtils';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  category: string;
  phone_number: string;
  address: string;
  registration_date: string;
  description: string;
}

const PatientsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*')
        .order('patient_id', { ascending: false });

      if (searchQuery) {
        // Check if search query is numeric (for patient ID search)
        const isNumeric = /^\d+$/.test(searchQuery);
        
        if (isNumeric) {
          // Search by patient ID
          query = query.eq('patient_id', parseInt(searchQuery));
        } else {
          // Search by name, category, or phone number
          query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Patient[];
    }
  });

  const handleExcelDownload = async () => {
    if (!patients || patients.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No patients data available to export."
      });
      return;
    }

    try {
      generatePatientsExcel(patients);
      toast({
        title: "Excel Generated",
        description: "Patients report has been downloaded successfully."
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to generate Excel file. Please try again."
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'FREE':
        return 'bg-blue-100 text-blue-800';
      case 'THALASSEMIC':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading patients: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patients Management</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Button 
              onClick={handleExcelDownload}
              variant="outline"
              disabled={!patients || patients.length === 0}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel Report
            </Button>
            <Link to="/add-patient">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient ID, name, category, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients?.filter(p => p.category === 'PAID').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Free</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients?.filter(p => p.category === 'FREE').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-full">
                  <User className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Thalassemic</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients?.filter(p => p.category === 'THALASSEMIC').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading patients...</p>
              </div>
            ) : patients && patients.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Age</TableHead>
                      <TableHead className="hidden sm:table-cell">Gender</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="hidden xl:table-cell">Registration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.patient_id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="sm:hidden text-sm text-gray-500">
                              {patient.age}y, {patient.gender}
                              {patient.category && (
                                <Badge className={`ml-2 ${getCategoryColor(patient.category)}`}>
                                  {patient.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{patient.age}</TableCell>
                        <TableCell className="hidden sm:table-cell">{patient.gender}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {patient.category ? (
                            <Badge className={getCategoryColor(patient.category)}>
                              {patient.category}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {patient.phone_number || '-'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {patient.registration_date 
                            ? format(new Date(patient.registration_date), 'MMM dd, yyyy')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Link to={`/patients/${patient.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:ml-2 sm:inline">Edit</span>
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? (
                  <div>
                    <p className="text-lg mb-2">No patients found</p>
                    <p>Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg mb-2">No patients registered yet</p>
                    <Link to="/add-patient">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Patient
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientsPage;

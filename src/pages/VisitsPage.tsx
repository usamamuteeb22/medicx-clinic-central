import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Users, Download, Calendar, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  phone_number: string;
  cnic: string;
  category: string;
}

interface Visit {
  id: string;
  patient_id: string;
  payment_amount: number;
  visit_date: string;
  created_at: string;
  patient: Patient;
}

const VisitsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitSearchTerm, setVisitSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Check access permissions
  const canAccessPage = user?.role === 'admin' || user?.role === 'reception';

  if (!canAccessPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Search patients for adding visits
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      let query = supabase
        .from('patients')
        .select('*')
        .order('name');

      // Handle numeric search (patient_id) vs text search
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      if (isNumeric) {
        query = query.eq('patient_id', parseInt(searchTerm.trim()));
      } else {
        query = query.or(`name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,cnic.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.trim().length > 0
  });

  // Search visits by patient
  const { data: visits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ['visits-search', visitSearchTerm],
    queryFn: async () => {
      if (!visitSearchTerm.trim()) return [];
      
      // First find patients matching the search
      const isNumeric = /^\d+$/.test(visitSearchTerm.trim());
      let patientQuery = supabase.from('patients').select('id');
      
      if (isNumeric) {
        patientQuery = patientQuery.eq('patient_id', parseInt(visitSearchTerm.trim()));
      } else {
        patientQuery = patientQuery.ilike('name', `%${visitSearchTerm}%`);
      }
      
      const { data: patientData, error: patientError } = await patientQuery;
      
      if (patientError) throw patientError;
      if (!patientData || patientData.length === 0) return [];

      const patientIds = patientData.map(p => p.id);

      // Then get visits for those patients
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select(`
          id,
          patient_id,
          payment_amount,
          visit_date,
          created_at
        `)
        .in('patient_id', patientIds)
        .order('visit_date', { ascending: false });

      if (visitsError) throw visitsError;

      // Get patient details for each visit
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      const patientMap = new Map(patientsData?.map(p => [p.id, p]) || []);

      return visitsData?.map(visit => ({
        ...visit,
        patient: patientMap.get(visit.patient_id)
      })).filter(visit => visit.patient) as Visit[] || [];
    },
    enabled: visitSearchTerm.trim().length > 0
  });

  const handleAddVisit = async () => {
    if (!selectedPatient) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a patient first"
      });
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid payment amount"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('visits')
        .insert({
          patient_id: selectedPatient.id,
          payment_amount: parseFloat(paymentAmount),
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Visit Added",
        description: `Visit for ${selectedPatient.name} has been recorded successfully`
      });

      // Reset form
      setSelectedPatient(null);
      setPaymentAmount('');
      setShowAddVisit(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding visit:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add visit. Please try again."
      });
    }
  };

  const handleDownloadExcel = async () => {
    try {
      let query = supabase
        .from('visits')
        .select(`
          id,
          patient_id,
          payment_amount,
          visit_date,
          created_at,
          patients (
            patient_id,
            name,
            category,
            phone_number
          )
        `)
        .order('visit_date', { ascending: false });

      // Apply date filters if provided
      if (startDate) {
        query = query.gte('visit_date', startDate);
      }
      if (endDate) {
        query = query.lte('visit_date', endDate + 'T23:59:59');
      }

      const { data, error } = await query;
      if (error) throw error;

      const excelData = data?.map(visit => ({
        'Patient ID': visit.patients?.patient_id,
        'Patient Name': visit.patients?.name,
        'Category': visit.patients?.category || 'N/A',
        'Phone Number': visit.patients?.phone_number,
        'Visit Date': format(new Date(visit.visit_date), 'dd/MM/yyyy'),
        'Visit Time': format(new Date(visit.visit_date), 'hh:mm a'),
        'Payment': `$${visit.payment_amount}`
      })) || [];

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Visits');

      const fileName = `visits_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Download Complete",
        description: `Visits data exported to ${fileName}`
      });
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download Excel file"
      });
    }
  };

  const resetDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'dd/MM/yyyy'),
      time: format(date, 'hh:mm a')
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Visits Management</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          <Users className="h-4 w-4 mr-2" />
          {user?.role}
        </Badge>
      </div>

      {/* Part A - Add Visit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Patient Visit</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Search Patient</Label>
            <Input
              placeholder="Search by Patient ID, Name, Phone, or CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {searchTerm && (
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {patientsLoading ? (
                  <div className="p-2 text-center text-gray-500">Searching...</div>
                ) : patients.length > 0 ? (
                  patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchTerm('');
                      }}
                    >
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-500">
                        ID: {patient.patient_id} | Phone: {patient.phone_number} | Age: {patient.age}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-gray-500">No patients found</div>
                )}
              </div>
            )}
          </div>

          {selectedPatient && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{selectedPatient.name}</h3>
                    <p className="text-sm text-gray-600">
                      ID: {selectedPatient.patient_id} | Age: {selectedPatient.age} | Phone: {selectedPatient.phone_number}
                    </p>
                    {selectedPatient.category && (
                      <p className="text-sm text-gray-600">Category: {selectedPatient.category}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-4 flex items-center space-x-4">
                  <Button
                    onClick={() => setShowAddVisit(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Visit</span>
                  </Button>
                </div>

                {showAddVisit && (
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="payment">Payment Amount</Label>
                        <Input
                          id="payment"
                          type="number"
                          step="0.01"
                          placeholder="Enter payment amount..."
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleAddVisit}>Save</Button>
                        <Button variant="outline" onClick={() => {
                          setShowAddVisit(false);
                          setPaymentAmount('');
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Part B - View Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>View Patient Visits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Search Visits by Patient</Label>
            <Input
              placeholder="Search by Patient ID or Name..."
              value={visitSearchTerm}
              onChange={(e) => setVisitSearchTerm(e.target.value)}
            />
          </div>

          {visitsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading visits...</p>
            </div>
          ) : visits.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => {
                    const { date, time } = formatDateTime(visit.visit_date);
                    return (
                      <TableRow key={visit.id} className="hover:bg-gray-50">
                        <TableCell>{visit.patient?.patient_id}</TableCell>
                        <TableCell className="font-medium">{visit.patient?.name}</TableCell>
                        <TableCell>{visit.patient?.category || 'N/A'}</TableCell>
                        <TableCell>{visit.patient?.phone_number}</TableCell>
                        <TableCell>{date}</TableCell>
                        <TableCell>{time}</TableCell>
                        <TableCell className="font-medium">${visit.payment_amount}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : visitSearchTerm ? (
            <div className="text-center py-8 text-gray-500">
              No visits found for the searched patient.
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Part C - Download Excel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Download Visits Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date (Optional)</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={handleDownloadExcel} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download Excel</span>
              </Button>
              <Button variant="outline" onClick={resetDateFilter}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitsPage;
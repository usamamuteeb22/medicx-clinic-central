
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { generatePatientsPDF } from '@/utils/patientsPdfUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
  address: string;
  registration_date: string;
  description: string;
}

const PatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('registration_date', { ascending: false });

      if (error) throw error;
      return data as Patient[];
    }
  });

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    try {
      console.log('Attempting to delete patient:', patientId, patientName);
      
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) {
        console.error('Error deleting patient:', error);
        throw error;
      }

      toast({
        title: "Patient Deleted",
        description: `${patientName} has been successfully deleted.`
      });

      queryClient.invalidateQueries({ queryKey: ['patients'] });
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete patient. Please try again."
      });
    }
  };

  const handleDownloadPDF = () => {
    generatePatientsPDF(filteredPatients);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toString().includes(searchTerm) ||
    patient.phone_number?.includes(searchTerm)
  );

  if (isLoading) {
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
        <Button onClick={handleDownloadPDF} variant="outline" className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-indigo-700">Search Patients</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, patient ID, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md border-blue-200 focus:border-blue-400"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-left p-2 font-medium text-indigo-700">Patient ID</th>
                  <th className="text-left p-2 font-medium text-indigo-700">Name</th>
                  <th className="text-left p-2 font-medium text-indigo-700">Age</th>
                  <th className="text-left p-2 font-medium text-indigo-700">Gender</th>
                  <th className="text-left p-2 font-medium text-indigo-700">Phone</th>
                  <th className="text-left p-2 font-medium text-indigo-700">Address</th>
                  <th className="text-left p-2 font-medium text-indigo-700">Registration Date</th>
                  <th className="text-left p-2 font-medium text-indigo-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-blue-50">
                    <td className="p-2">
                      <Badge variant="outline" className="border-blue-300 text-blue-700">{patient.patient_id}</Badge>
                    </td>
                    <td className="p-2 font-medium">{patient.name}</td>
                    <td className="p-2">{patient.age}</td>
                    <td className="p-2">
                      <Badge variant={patient.gender === 'Male' ? 'default' : 'secondary'} className={patient.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}>
                        {patient.gender}
                      </Badge>
                    </td>
                    <td className="p-2">{patient.phone_number}</td>
                    <td className="p-2">{patient.address}</td>
                    <td className="p-2">
                      {new Date(patient.registration_date).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/patient/${patient.id}/edit`)}
                          className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user?.role === 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {patient.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePatient(patient.id, patient.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsPage;

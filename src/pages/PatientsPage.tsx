
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
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

  const handleDeletePatient = async (patientId: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: "Patient Deleted",
        description: "Patient has been successfully deleted."
      });

      // Refresh the patients list
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, patient ID, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Patient ID</th>
                  <th className="text-left p-2 font-medium">Name</th>
                  <th className="text-left p-2 font-medium">Age</th>
                  <th className="text-left p-2 font-medium">Gender</th>
                  <th className="text-left p-2 font-medium">Phone</th>
                  <th className="text-left p-2 font-medium">Address</th>
                  <th className="text-left p-2 font-medium">Registration Date</th>
                  <th className="text-left p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Badge variant="outline">{patient.patient_id}</Badge>
                    </td>
                    <td className="p-2 font-medium">{patient.name}</td>
                    <td className="p-2">{patient.age}</td>
                    <td className="p-2">
                      <Badge variant={patient.gender === 'Male' ? 'default' : 'secondary'}>
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user?.role === 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
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
                                  onClick={() => handleDeletePatient(patient.id)}
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

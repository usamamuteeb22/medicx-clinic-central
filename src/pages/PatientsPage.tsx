
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Search, Users, Edit, X } from 'lucide-react';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number?: string;
  address?: string;
  description?: string;
  registration_date: string;
}

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    name: '',
    phone: ''
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone_number: '',
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

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

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      phone_number: patient.phone_number || '',
      address: patient.address || '',
      description: patient.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          name: editFormData.name,
          age: parseInt(editFormData.age),
          gender: editFormData.gender,
          phone_number: editFormData.phone_number || null,
          address: editFormData.address || null,
          description: editFormData.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPatient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient information updated successfully"
      });

      setIsEditDialogOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update patient information"
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
    
    return matchesId && matchesName && matchesPhone;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patients Management</h1>
          <p className="text-gray-600">View and edit patient information</p>
        </div>
      </div>

      {/* Search Patient Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>All Patients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow 
                        key={patient.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePatientClick(patient)}
                      >
                        <TableCell>{patient.patient_id}</TableCell>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.phone_number || 'N/A'}</TableCell>
                        <TableCell>{patient.address || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(patient.registration_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePatientClick(patient);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Edit Patient Information</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedPatient && (
            <form onSubmit={handleUpdatePatient} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Patient Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select 
                    value={editFormData.gender} 
                    onValueChange={(value) => setEditFormData({...editFormData, gender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={editFormData.phone_number}
                    onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Patient'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsPage;

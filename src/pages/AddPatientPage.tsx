
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
import { toast } from '@/hooks/use-toast';
import { Search, UserPlus } from 'lucide-react';

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

const AddPatientPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone_number: '',
    address: '',
    description: ''
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .insert([
          {
            name: formData.name,
            age: parseInt(formData.age),
            gender: formData.gender,
            phone_number: formData.phone_number || null,
            address: formData.address || null,
            description: formData.description || null,
            created_by: user.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient registered successfully"
      });

      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: '',
        phone_number: '',
        address: '',
        description: ''
      });

      // Refresh patients list
      fetchPatients();
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to register patient"
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
      {/* Patient Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Patient Registration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Patient Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? 'Registering...' : 'Register Patient'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Patient Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Patients</span>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
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
                        <TableCell>{patient.phone_number || 'N/A'}</TableCell>
                        <TableCell>{patient.address || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(patient.registration_date).toLocaleDateString()}
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
    </div>
  );
};

export default AddPatientPage;

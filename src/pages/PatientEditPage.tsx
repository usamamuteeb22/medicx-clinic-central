
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age?: number;
  age_years?: number;
  age_months?: number;
  age_days?: number;
  gender: string;
  phone_number: string;
  cnic?: string;
  category?: string;
}

const PatientEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    age_years: '',
    age_months: '',
    age_days: '',
    gender: '',
    phone_number: '',
    cnic: '',
    category: ''
  });

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Patient;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        age_years: patient.age_years?.toString() || patient.age?.toString() || '',
        age_months: patient.age_months?.toString() || '',
        age_days: patient.age_days?.toString() || '',
        gender: patient.gender,
        phone_number: patient.phone_number || '',
        cnic: patient.cnic || '',
        category: patient.category || ''
      });
    }
  }, [patient]);

  const updatePatientMutation = useMutation({
    mutationFn: async (updatedData: Partial<Patient>) => {
      const { error } = await supabase
        .from('patients')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Patient Updated",
        description: "Patient information has been successfully updated."
      });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      navigate('/all-patients');
    },
    onError: (error) => {
      console.error('Error updating patient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update patient. Please try again."
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total age for backward compatibility
    const totalYears = parseInt(formData.age_years || '0') + 
                      (parseInt(formData.age_months || '0') / 12) + 
                      (parseInt(formData.age_days || '0') / 365);

    const updatedData = {
      name: formData.name,
      age: Math.floor(totalYears),
      age_years: parseInt(formData.age_years || '0'),
      age_months: parseInt(formData.age_months || '0'),
      age_days: parseInt(formData.age_days || '0'),
      gender: formData.gender,
      phone_number: formData.phone_number || null,
      cnic: formData.cnic || null,
      category: formData.category || null,
      updated_at: new Date().toISOString()
    };

    updatePatientMutation.mutate(updatedData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading patient information...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Patient not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/all-patients')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Patient: {patient.name} (ID: {patient.patient_id})
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  placeholder="e.g., 12345-1234567-1"
                />
              </div>
            </div>

            {/* Age Fields */}
            <div className="space-y-2">
              <Label>Age</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="age_years" className="text-sm">Years</Label>
                  <Input
                    id="age_years"
                    type="number"
                    min="0"
                    max="150"
                    value={formData.age_years}
                    onChange={(e) => setFormData({ ...formData, age_years: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="age_months" className="text-sm">Months</Label>
                  <Input
                    id="age_months"
                    type="number"
                    min="0"
                    max="11"
                    value={formData.age_months}
                    onChange={(e) => setFormData({ ...formData, age_months: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="age_days" className="text-sm">Days</Label>
                  <Input
                    id="age_days"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.age_days}
                    onChange={(e) => setFormData({ ...formData, age_days: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Thalassemic">Thalassemic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate('/all-patients')}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePatientMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updatePatientMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientEditPage;

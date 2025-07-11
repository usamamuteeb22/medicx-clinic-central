
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PatientRegistrationFormProps {
  onPatientAdded: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({ onPatientAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone_number: '',
    address: '',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add patients"
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare the data payload with proper category handling
      const payload = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone_number: formData.phone_number || null,
        address: formData.address || null,
        // Ensure category is null if empty string, otherwise use the selected value
        category: formData.category === '' ? null : formData.category,
        description: formData.description || null,
        created_by: user.id
      };

      console.log('Submitting patient data:', payload);

      const { data, error } = await supabase
        .from('patients')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error adding patient:', error);
        throw error;
      }

      console.log('Patient added successfully:', data);

      toast({
        title: "Success",
        description: "Patient added successfully!"
      });

      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: '',
        phone_number: '',
        address: '',
        category: '',
        description: ''
      });

      onPatientAdded();
    } catch (error: any) {
      console.error('Error adding patient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add patient"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="150"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
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
            <Select
              value={formData.category}
              onValueChange={(value) => {
                console.log('Category selected:', value);
                setFormData({ ...formData, category: value });
              }}
            >
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

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description/Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding Patient...' : 'Add Patient'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientRegistrationForm;

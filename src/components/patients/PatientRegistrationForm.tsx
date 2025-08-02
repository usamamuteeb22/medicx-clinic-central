
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    age_years: '',
    age_months: '',
    age_days: '',
    gender: '',
    phone_number: '',
    cnic: '',
    category: ''
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
      // Calculate total age in years for backward compatibility
      const totalYears = parseInt(formData.age_years || '0') + 
                        (parseInt(formData.age_months || '0') / 12) + 
                        (parseInt(formData.age_days || '0') / 365);

      const payload = {
        name: formData.name,
        age: Math.floor(totalYears), // Keep for backward compatibility
        age_years: parseInt(formData.age_years || '0'),
        age_months: parseInt(formData.age_months || '0'),
        age_days: parseInt(formData.age_days || '0'),
        gender: formData.gender,
        phone_number: formData.phone_number || null,
        cnic: formData.cnic || null,
        category: formData.category === '' ? null : formData.category,
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
        age_years: '',
        age_months: '',
        age_days: '',
        gender: '',
        phone_number: '',
        cnic: '',
        category: ''
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding Patient...' : 'Add Patient'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientRegistrationForm;

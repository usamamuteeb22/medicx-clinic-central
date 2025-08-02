
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import PatientSelector from '@/components/PatientSelector';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

const ReceptionReportPage = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    blood_pressure: '',
    temperature: '',
    weight: '',
    bsr: '',
    saturation: '',
    clinical_complaint: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a patient first"
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create reports"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_reports')
        .insert({
          patient_id: selectedPatient.id,
          blood_pressure: formData.blood_pressure || null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          bsr: formData.bsr ? parseFloat(formData.bsr) : null,
          saturation: formData.saturation ? parseFloat(formData.saturation) : null,
          clinical_complaint: formData.clinical_complaint || null,
          created_by: user.id,
          created_by_role: 'reception',
          reception_completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reception report created successfully!"
      });

      // Reset form
      setFormData({
        blood_pressure: '',
        temperature: '',
        weight: '',
        bsr: '',
        saturation: '',
        clinical_complaint: ''
      });
      setSelectedPatient(null);

    } catch (error: any) {
      console.error('Error creating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create reception report"
      });
    } finally {
      setLoading(false);
    }
  };

  const canAccessPage = user?.role === 'admin' || user?.role === 'reception';

  if (!canAccessPage) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only Admin and Reception users can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reception Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label>Select Patient *</Label>
              <PatientSelector
                selectedPatient={selectedPatient}
                onPatientSelect={setSelectedPatient}
              />
            </div>

            {selectedPatient && (
              <>
                {/* Medical Vitals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medical Vitals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="blood_pressure">Blood Pressure</Label>
                        <Input
                          id="blood_pressure"
                          value={formData.blood_pressure}
                          onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                          placeholder="e.g., 120/80"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperature">Temperature (°F)</Label>
                        <Input
                          id="temperature"
                          type="number"
                          step="0.1"
                          value={formData.temperature}
                          onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                          placeholder="e.g., 98.6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="e.g., 70.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bsr">BSR</Label>
                        <Input
                          id="bsr"
                          type="number"
                          value={formData.bsr}
                          onChange={(e) => setFormData({ ...formData, bsr: e.target.value })}
                          placeholder="e.g., 15"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="saturation">Saturation (%)</Label>
                        <Input
                          id="saturation"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.saturation}
                          onChange={(e) => setFormData({ ...formData, saturation: e.target.value })}
                          placeholder="e.g., 98"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Clinical Complaint */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Clinical Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="clinical_complaint">Clinical Complaint</Label>
                      <Textarea
                        id="clinical_complaint"
                        value={formData.clinical_complaint}
                        onChange={(e) => setFormData({ ...formData, clinical_complaint: e.target.value })}
                        rows={4}
                        placeholder="Enter patient's clinical complaint details..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating Report...' : 'Create Reception Report'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceptionReportPage;

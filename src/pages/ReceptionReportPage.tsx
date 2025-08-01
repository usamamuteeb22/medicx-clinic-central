import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Patient } from '@/types/reportTypes';

const ReceptionReportPage = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    blood_pressure: '',
    temperature: '',
    weight: '',
    bsr: '',
    saturation: '',
    clinical_complaint: '',
  });
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch patients"
      });
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    // Reset form data when a new patient is selected
    setFormData({
      blood_pressure: '',
      temperature: '',
      weight: '',
      bsr: '',
      saturation: '',
      clinical_complaint: '',
    });
  };

  const handleSave = async (completeReport: boolean) => {
    if (!selectedPatient) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a patient first"
      });
      return;
    }

    if (completeReport && !formData.clinical_complaint) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Clinical Complaint is required to complete the report"
      });
      return;
    }

    try {
      if (completeReport) {
        setCompleting(true);
      } else {
        setSaving(true);
      }

      // Check if there's an existing reception report for the selected patient
      const { data: existingReport, error: checkError } = await supabase
        .from('patient_reports')
        .select('*')
        .eq('patient_id', selectedPatient.id)
        .eq('created_by_role', 'reception')
        .is('reception_completed_at', null)
        .single();

      if (existingReport && !checkError) {
        // Pre-fill form with existing data (remove hemoglobin, wbc, platelets references)
        setFormData({
          bsr: existingReport.bsr?.toString() || '',
          saturation: existingReport.saturation?.toString() || '',
          blood_pressure: existingReport.blood_pressure || '',
          temperature: existingReport.temperature?.toString() || '',
          weight: existingReport.weight?.toString() || '',
          clinical_complaint: existingReport.clinical_complaint || '',
        });

        // Update the existing report
        const { error: updateError } = await supabase
          .from('patient_reports')
          .update({
            bsr: formData.bsr ? parseFloat(formData.bsr) : null,
            saturation: formData.saturation ? parseFloat(formData.saturation) : null,
            blood_pressure: formData.blood_pressure || null,
            temperature: formData.temperature ? parseFloat(formData.temperature) : null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            clinical_complaint: formData.clinical_complaint || null,
            reception_completed_at: completeReport ? new Date().toISOString() : null,
            created_by: user?.id,
            created_by_role: 'reception'
          })
          .eq('id', existingReport.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: `Reception report ${completeReport ? 'completed' : 'saved'} successfully!`
        });
      } else {
        // Create a new reception report
        const { error: insertError } = await supabase
          .from('patient_reports')
          .insert({
            patient_id: selectedPatient.id,
            bsr: formData.bsr ? parseFloat(formData.bsr) : null,
            saturation: formData.saturation ? parseFloat(formData.saturation) : null,
            blood_pressure: formData.blood_pressure || null,
            temperature: formData.temperature ? parseFloat(formData.temperature) : null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            clinical_complaint: formData.clinical_complaint || null,
            reception_completed_at: completeReport ? new Date().toISOString() : null,
            created_by: user?.id,
            created_by_role: 'reception'
          });

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: `Reception report ${completeReport ? 'created and completed' : 'created and saved'} successfully!`
        });
      }

      // Reset form and selected patient after successful save
      if (completeReport) {
        setSelectedPatient(null);
        setFormData({
          blood_pressure: '',
          temperature: '',
          weight: '',
          bsr: '',
          saturation: '',
          clinical_complaint: '',
        });
      }

    } catch (error: any) {
      console.error('Error saving reception report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save reception report"
      });
    } finally {
      setSaving(false);
      setCompleting(false);
    }
  };

  if (!user?.id) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reception Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Select Patient</Label>
            <Select onValueChange={(value) => {
              const patient = patients.find(p => p.id === value);
              if (patient) {
                handlePatientSelect(patient);
              }
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} (ID: {patient.patient_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPatient && (
            <>
              {/* Medical Vitals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="blood_pressure">Blood Pressure</Label>
                  <Input
                    type="text"
                    id="blood_pressure"
                    placeholder="e.g., 120/80"
                    value={formData.blood_pressure}
                    onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    type="text"
                    id="temperature"
                    placeholder="e.g., 36.5"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    type="text"
                    id="weight"
                    placeholder="e.g., 70.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bsr">BSR</Label>
                  <Input
                    type="text"
                    id="bsr"
                    placeholder="e.g., 15.2"
                    value={formData.bsr}
                    onChange={(e) => setFormData({ ...formData, bsr: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="saturation">Saturation</Label>
                  <Input
                    type="text"
                    id="saturation"
                    placeholder="e.g., 98.5"
                    value={formData.saturation}
                    onChange={(e) => setFormData({ ...formData, saturation: e.target.value })}
                  />
                </div>
              </div>

              {/* Clinical Complaint */}
              <div className="space-y-2">
                <Label htmlFor="clinical_complaint">Clinical Complaint</Label>
                <Textarea
                  id="clinical_complaint"
                  placeholder="Describe the patient's complaints and symptoms..."
                  value={formData.clinical_complaint}
                  onChange={(e) => setFormData({ ...formData, clinical_complaint: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving || completing}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={() => handleSave(true)} disabled={saving || completing}>
                  {completing ? 'Completing...' : 'Save & Complete'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceptionReportPage;

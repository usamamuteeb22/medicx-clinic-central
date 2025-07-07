
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PatientSelector from '@/components/PatientSelector';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface ReceptionReportFormProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
  hemoglobin: string;
  setHemoglobin: (value: string) => void;
  wbc: string;
  setWbc: (value: string) => void;
  platelets: string;
  setPlatelets: (value: string) => void;
  bloodPressure: string;
  setBloodPressure: (value: string) => void;
  temperature: string;
  setTemperature: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  clinicalComplaint: string;
  setClinicalComplaint: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReceptionReportForm: React.FC<ReceptionReportFormProps> = ({
  selectedPatient,
  onPatientSelect,
  hemoglobin,
  setHemoglobin,
  wbc,
  setWbc,
  platelets,
  setPlatelets,
  bloodPressure,
  setBloodPressure,
  temperature,
  setTemperature,
  weight,
  setWeight,
  clinicalComplaint,
  setClinicalComplaint,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create Medical Vitals Report</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <PatientSelector
            selectedPatient={selectedPatient}
            onPatientSelect={onPatientSelect}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
              <Input
                id="hemoglobin"
                type="number"
                step="0.1"
                value={hemoglobin}
                onChange={(e) => setHemoglobin(e.target.value)}
                placeholder="e.g., 12.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wbc">WBC Count</Label>
              <Input
                id="wbc"
                type="number"
                value={wbc}
                onChange={(e) => setWbc(e.target.value)}
                placeholder="e.g., 7000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platelets">Platelets</Label>
              <Input
                id="platelets"
                type="number"
                value={platelets}
                onChange={(e) => setPlatelets(e.target.value)}
                placeholder="e.g., 250000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
              <Input
                id="bloodPressure"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                placeholder="e.g., 120/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g., 98.6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 70.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalComplaint">Clinical Complaint</Label>
            <textarea
              id="clinicalComplaint"
              value={clinicalComplaint}
              onChange={(e) => setClinicalComplaint(e.target.value)}
              placeholder="Describe patient's symptoms and complaints..."
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Report'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReceptionReportForm;

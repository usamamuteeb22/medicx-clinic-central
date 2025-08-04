
export interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
}

export interface PrescribedMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  days: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  before_meal: boolean;
  after_meal: boolean;
  fasting: boolean;
  note?: string; // New field for per-medicine notes
}

export interface FormData {
  blood_pressure: string;
  temperature: string;
  weight: string;
  bsr: string;
  saturation: string;
  clinical_complaint: string;
  medical_history: string;
  observations: string;
  recommendations: string;
  patient_history: string; // New field to replace medicine_notes and test_advice
}

export interface PatientReport {
  id: string;
  patient_id: string;
  bsr: number | null;
  saturation: number | null;
  blood_pressure: string | null;
  temperature: number | null;
  weight: number | null;
  clinical_complaint: string | null;
  medical_history: string | null;
  observations: string | null;
  recommendations: string | null;
  patient_history: string | null;
  created_at: string;
  created_by: string | null;
  created_by_role: string | null;
  doctor_completed_at: string | null;
  reception_completed_at: string | null;
  report_date: string;
  patient?: Patient;
}

export interface ReceptionReport {
  id: string;
  report_id: number;
  patient_id: string;
  created_at: string;
  patient: Patient;
}

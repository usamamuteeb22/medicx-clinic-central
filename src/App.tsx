
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LoginPage from '@/components/LoginPage';
import HomePage from '@/pages/HomePage';
import AddPatientPage from '@/pages/AddPatientPage';
import PatientReportPage from '@/pages/PatientReportPage';
import ReportsPage from '@/pages/ReportsPage';
import MedicineStockPage from '@/pages/MedicineStockPage';
import MedicineDetailPage from '@/pages/MedicineDetailPage';
import MedicineUsagePage from '@/pages/MedicineUsagePage';
import PatientsPage from '@/pages/PatientsPage';
import PatientEditPage from '@/pages/PatientEditPage';
import ReceptionReportPage from '@/pages/ReceptionReportPage';
import TrackingPage from '@/pages/TrackingPage';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/add-patient" element={<AddPatientPage />} />
        <Route path="/patient-reports" element={<PatientReportPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reception-reports" element={<ReceptionReportPage />} />
        <Route path="/medicine-stock" element={<MedicineStockPage />} />
        <Route path="/medicine/:id" element={<MedicineDetailPage />} />
        <Route path="/medicine-usage" element={<MedicineUsagePage />} />
        <Route path="/all-patients" element={<PatientsPage />} />
        <Route path="/patient/:id/edit" element={<PatientEditPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

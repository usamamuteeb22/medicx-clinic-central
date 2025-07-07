
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import LoginPage from "@/components/LoginPage";
import Index from "./pages/Index";
import PatientsPage from "./pages/PatientsPage";
import AddPatientPage from "./pages/AddPatientPage";
import PatientEditPage from "./pages/PatientEditPage";
import PatientReportPage from "./pages/PatientReportPage";
import ReceptionReportsPage from "./pages/ReceptionReportsPage";
import MedicineStockPage from "./pages/MedicineStockPage";
import MedicineDetailPage from "./pages/MedicineDetailPage";
import MedicineUsagePage from "./pages/MedicineUsagePage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route component (for login page)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route index element={<Index />} />
                      <Route path="patients" element={<PatientsPage />} />
                      <Route path="add-patient" element={<AddPatientPage />} />
                      <Route path="patients/:id/edit" element={<PatientEditPage />} />
                      <Route path="patient-reports" element={<PatientReportPage />} />
                      <Route path="reception-reports" element={<ReceptionReportsPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="medicine-stock" element={<MedicineStockPage />} />
                      <Route path="medicine-stock/:id" element={<MedicineDetailPage />} />
                      <Route path="medicine-usage" element={<MedicineUsagePage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

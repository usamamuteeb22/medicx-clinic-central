
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import AddPatientPage from "./pages/AddPatientPage";
import PatientsPage from "./pages/PatientsPage";
import PatientEditPage from "./pages/PatientEditPage";
import MedicineStockPage from "./pages/MedicineStockPage";
import MedicineDetailPage from "./pages/MedicineDetailPage";
import PatientReportPage from "./pages/PatientReportPage";
import ReceptionReportPage from "./pages/ReceptionReportPage";
import ReportsPage from "./pages/ReportsPage";
import MedicineUsagePage from "./pages/MedicineUsagePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
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
              path="/" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patients" 
              element={
                <ProtectedRoute>
                  <AddPatientPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/all-patients" 
              element={
                <ProtectedRoute>
                  <PatientsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/:id/edit" 
              element={
                <ProtectedRoute>
                  <PatientEditPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reception-reports" 
              element={
                <ProtectedRoute>
                  <ReceptionReportPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient-reports" 
              element={
                <ProtectedRoute>
                  <PatientReportPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/medicine-usage" 
              element={
                <ProtectedRoute>
                  <MedicineUsagePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/medicines" 
              element={
                <ProtectedRoute>
                  <MedicineStockPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/medicines/:id" 
              element={
                <ProtectedRoute>
                  <MedicineDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

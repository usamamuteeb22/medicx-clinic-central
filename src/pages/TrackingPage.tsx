
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Search, Package, History, Users, BarChart3 } from 'lucide-react';
import { generateMedicineUsageExcel } from '@/utils/medicineUsageExcelUtils';
import { generateMedicineUsagePDF } from '@/utils/medicineUsagePdfUtils';
import { generatePatientsExcel } from '@/utils/patientsExcelUtils';
import { generateMedicineStockExcel } from '@/utils/medicineStockExcelUtils';
import { generateMedicineStockPDF } from '@/utils/medicineStockPdfUtils';

interface TrackingFilters {
  category: string;
  status: string;
  stockQuantity: string;
  medicine_id: string;
  start_date: string;
  end_date: string;
  patient_search: string;
}

const TrackingPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [filters, setFilters] = useState<TrackingFilters>({
    category: '',
    status: '',
    stockQuantity: '',
    medicine_id: '',
    start_date: '',
    end_date: '',
    patient_search: ''
  });
  const [medicines, setMedicines] = useState<any[]>([]);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [receptionReports, setReceptionReports] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if user has pharmacy role
  if (user?.role !== 'pharmacy') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">This page is only accessible to pharmacy users.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fetchMedicineInventory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        if (filters.status === 'out_of_stock') {
          query = query.eq('total_quantity', 0);
        } else if (filters.status === 'low_stock') {
          query = query.lt('total_quantity', 10);
        } else if (filters.status === 'in_stock') {
          query = query.gt('total_quantity', 0);
        }
      }

      if (filters.stockQuantity) {
        query = query.lt('total_quantity', parseInt(filters.stockQuantity));
      }

      const { data, error } = await query;
      if (error) throw error;
      setMedicines(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch medicine inventory"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockHistory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('medicine_stock_history')
        .select(`
          *,
          medicine:medicines(name, category)
        `)
        .order('created_at', { ascending: false });

      if (filters.medicine_id) {
        query = query.eq('medicine_id', filters.medicine_id);
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStockHistory(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch stock history"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReceptionReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('patient_reports')
        .select(`
          id,
          patient_id,
          blood_pressure,
          temperature,
          weight,
          bsr,
          saturation,
          created_at,
          patient:patients(patient_id, name)
        `)
        .order('created_at', { ascending: false });

      if (filters.patient_search) {
        // First find matching patients
        const { data: patients } = await supabase
          .from('patients')
          .select('id')
          .or(`name.ilike.%${filters.patient_search}%,patient_id.eq.${filters.patient_search},phone_number.ilike.%${filters.patient_search}%`);
        
        if (patients && patients.length > 0) {
          const patientIds = patients.map(p => p.id);
          query = query.in('patient_id', patientIds);
        } else {
          setReceptionReports([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setReceptionReports(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch reception reports"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    setLoading(true);
    try {
      // This would require custom SQL or multiple queries
      // For now, we'll create a simplified version
      const startDate = filters.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = filters.end_date || new Date().toISOString().split('T')[0];

      const { data: reports, error: reportsError } = await supabase
        .from('patient_reports')
        .select('created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('registration_date')
        .gte('registration_date', startDate)
        .lte('registration_date', endDate);

      if (reportsError || patientsError) throw reportsError || patientsError;

      // Group by date
      const statsMap = new Map();
      
      reports?.forEach(report => {
        const date = new Date(report.created_at).toISOString().split('T')[0];
        if (!statsMap.has(date)) {
          statsMap.set(date, { date, reportCount: 0, patientCount: 0 });
        }
        statsMap.get(date).reportCount++;
      });

      patients?.forEach(patient => {
        const date = new Date(patient.registration_date).toISOString().split('T')[0];
        if (!statsMap.has(date)) {
          statsMap.set(date, { date, reportCount: 0, patientCount: 0 });
        }
        statsMap.get(date).patientCount++;
      });

      setDailyStats(Array.from(statsMap.values()).sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch daily statistics"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
    
    // Clear previous data
    setMedicines([]);
    setStockHistory([]);
    setReceptionReports([]);
    setDailyStats([]);

    // Fetch data based on section
    switch (section) {
      case 'inventory':
        if (activeSection !== section) fetchMedicineInventory();
        break;
      case 'stock-history':
        if (activeSection !== section) fetchStockHistory();
        break;
      case 'reception-reports':
        if (activeSection !== section) fetchReceptionReports();
        break;
      case 'daily-stats':
        if (activeSection !== section) fetchDailyStats();
        break;
    }
  };

  const handleExportExcel = () => {
    try {
      switch (activeSection) {
        case 'inventory':
          generateMedicineStockExcel(medicines);
          break;
        case 'stock-history':
          generateMedicineUsageExcel(stockHistory);
          break;
        case 'reception-reports':
          generatePatientsExcel(receptionReports);
          break;
        case 'daily-stats':
          // Custom export for daily stats
          const csvContent = 'Date,New Patients,Reports\n' + 
            dailyStats.map(stat => `${stat.date},${stat.patientCount},${stat.reportCount}`).join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `daily-stats-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          break;
      }
      toast({
        title: "Export Successful",
        description: "Data has been exported to Excel"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export data"
      });
    }
  };

  const handleExportPDF = () => {
    try {
      switch (activeSection) {
        case 'inventory':
          generateMedicineStockPDF(medicines);
          break;
        case 'stock-history':
          generateMedicineUsagePDF(stockHistory);
          break;
        default:
          toast({
            variant: "destructive",
            title: "Not Available",
            description: "PDF export not available for this section"
          });
          return;
      }
      toast({
        title: "Export Successful",
        description: "Data has been exported to PDF"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export data"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Tracking Dashboard</h1>
        <p className="text-gray-600">Monitor medicine inventory, usage, and patient reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Medicine Inventory Section */}
        <Card className={`cursor-pointer transition-all duration-300 ${activeSection === 'inventory' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}>
          <CardHeader 
            className="text-center pb-4"
            onClick={() => handleSectionClick('inventory')}
          >
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Medicine Inventory</CardTitle>
          </CardHeader>
          {activeSection === 'inventory' && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Syrup">Syrup</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All status</SelectItem>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stock Less Than</Label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={filters.stockQuantity}
                    onChange={(e) => setFilters({...filters, stockQuantity: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={fetchMedicineInventory} size="sm" className="flex-1">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
                {medicines.length > 0 && (
                  <>
                    <Button onClick={handleExportExcel} variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleExportPDF} variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              {medicines.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  <div className="text-sm space-y-2">
                    {medicines.map((medicine) => (
                      <div key={medicine.id} className="p-2 border rounded">
                        <div className="font-medium">{medicine.name}</div>
                        <div className="text-gray-600">Category: {medicine.category}</div>
                        <div className="text-gray-600">Stock: {medicine.total_quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Stock History Section */}
        <Card className={`cursor-pointer transition-all duration-300 ${activeSection === 'stock-history' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}>
          <CardHeader 
            className="text-center pb-4"
            onClick={() => handleSectionClick('stock-history')}
          >
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <History className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Stock History</CardTitle>
          </CardHeader>
          {activeSection === 'stock-history' && (
            <CardContent className="space-y-4">
              {/* Similar filters and display logic for stock history */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={fetchStockHistory} size="sm" className="flex-1">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
                {stockHistory.length > 0 && (
                  <>
                    <Button onClick={handleExportExcel} variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleExportPDF} variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Patient Reception Reports */}
        <Card className={`cursor-pointer transition-all duration-300 ${activeSection === 'reception-reports' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}>
          <CardHeader 
            className="text-center pb-4"
            onClick={() => handleSectionClick('reception-reports')}
          >
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Reception Reports</CardTitle>
          </CardHeader>
          {activeSection === 'reception-reports' && (
            <CardContent className="space-y-4">
              <div>
                <Label>Patient Name/ID/Phone</Label>
                <Input
                  placeholder="Search patient..."
                  value={filters.patient_search}
                  onChange={(e) => setFilters({...filters, patient_search: e.target.value})}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={fetchReceptionReports} size="sm" className="flex-1">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
                {receptionReports.length > 0 && (
                  <Button onClick={handleExportExcel} variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Daily Statistics */}
        <Card className={`cursor-pointer transition-all duration-300 ${activeSection === 'daily-stats' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}>
          <CardHeader 
            className="text-center pb-4"
            onClick={() => handleSectionClick('daily-stats')}
          >
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Daily Statistics</CardTitle>
          </CardHeader>
          {activeSection === 'daily-stats' && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={fetchDailyStats} size="sm" className="flex-1">
                  <Search className="h-4 w-4 mr-1" />
                  Generate
                </Button>
                {dailyStats.length > 0 && (
                  <Button onClick={handleExportExcel} variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default TrackingPage;

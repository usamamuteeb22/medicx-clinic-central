
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// Medicine categories from the database enum
const MEDICINE_CATEGORIES = [
  'tablet', 'syrup', 'injection', 'sachet', 'drops', 
  'lotion', 'cream', 'ointment', 'suspension', 'gel', 
  'infusion', 'transfusion', 'Capsule'
] as const;

type MedicineCategory = typeof MEDICINE_CATEGORIES[number];

const TrackingPage = () => {
  // Medicine Inventory Section State
  const [inventoryCategory, setInventoryCategory] = useState<string>('');
  const [inventoryStatus, setInventoryStatus] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<string>('');

  // Medicine Stock History Section State
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [historyStartDate, setHistoryStartDate] = useState<Date | undefined>();
  const [historyEndDate, setHistoryEndDate] = useState<Date | undefined>();

  // Patient Reception Reports Section State
  const [patientSearch, setPatientSearch] = useState<string>('');

  // Daily Patient & Report Count Section State
  const [dailyStartDate, setDailyStartDate] = useState<Date | undefined>();
  const [dailyEndDate, setDailyEndDate] = useState<Date | undefined>();

  // Fetch medicines for dropdown
  const { data: medicines } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Medicine Inventory Query
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['medicine-inventory', inventoryCategory, inventoryStatus, stockQuantity],
    queryFn: async () => {
      let query = supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (inventoryCategory) {
        // Ensure the category is a valid enum value
        if (MEDICINE_CATEGORIES.includes(inventoryCategory as MedicineCategory)) {
          query = query.eq('category', inventoryCategory as MedicineCategory);
        }
      }

      if (inventoryStatus === 'out_of_stock') {
        query = query.eq('total_quantity', 0);
      } else if (inventoryStatus === 'low_stock') {
        query = query.lte('total_quantity', 10);
      } else if (inventoryStatus === 'in_stock') {
        query = query.gt('total_quantity', 0);
      }

      if (stockQuantity) {
        const quantity = parseInt(stockQuantity);
        if (!isNaN(quantity)) {
          query = query.lt('total_quantity', quantity);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(inventoryCategory || inventoryStatus || stockQuantity)
  });

  // Medicine Stock History Query
  const { data: stockHistoryData, isLoading: stockHistoryLoading } = useQuery({
    queryKey: ['medicine-stock-history', selectedMedicine, historyStartDate, historyEndDate],
    queryFn: async () => {
      let query = supabase
        .from('medicine_stock_history')
        .select(`
          *,
          medicine:medicines(name)
        `)
        .order('created_at', { ascending: false });

      if (selectedMedicine) {
        query = query.eq('medicine_id', selectedMedicine);
      }

      if (historyStartDate) {
        query = query.gte('created_at', historyStartDate.toISOString());
      }

      if (historyEndDate) {
        query = query.lte('created_at', historyEndDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(selectedMedicine && historyStartDate && historyEndDate)
  });

  // Patient Reception Reports Query
  const { data: receptionReportsData, isLoading: receptionReportsLoading } = useQuery({
    queryKey: ['patient-reception-reports', patientSearch],
    queryFn: async () => {
      let query = supabase
        .from('patient_reports')
        .select(`
          *,
          patient:patients(name, patient_id, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (patientSearch) {
        const { data: patients } = await supabase
          .from('patients')
          .select('id')
          .or(`name.ilike.%${patientSearch}%,patient_id.eq.${parseInt(patientSearch) || 0},phone_number.ilike.%${patientSearch}%`);
        
        if (patients && patients.length > 0) {
          const patientIds = patients.map(p => p.id);
          query = query.in('patient_id', patientIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!patientSearch
  });

  // Daily Patient & Report Count Query
  const { data: dailyCountData, isLoading: dailyCountLoading } = useQuery({
    queryKey: ['daily-count', dailyStartDate, dailyEndDate],
    queryFn: async () => {
      if (!dailyStartDate || !dailyEndDate) return [];

      const { data: reports } = await supabase
        .from('patient_reports')
        .select('created_at')
        .gte('created_at', dailyStartDate.toISOString())
        .lte('created_at', dailyEndDate.toISOString());

      const { data: patients } = await supabase
        .from('patients')
        .select('registration_date')
        .gte('registration_date', dailyStartDate.toISOString())
        .lte('registration_date', dailyEndDate.toISOString());

      // Group by date
      const dateMap = new Map();
      
      reports?.forEach(report => {
        const date = new Date(report.created_at).toDateString();
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, reportCount: 0, patientCount: 0 });
        }
        dateMap.get(date).reportCount++;
      });

      patients?.forEach(patient => {
        const date = new Date(patient.registration_date).toDateString();
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, reportCount: 0, patientCount: 0 });
        }
        dateMap.get(date).patientCount++;
      });

      return Array.from(dateMap.values());
    },
    enabled: !!(dailyStartDate && dailyEndDate)
  });

  const exportToExcel = (data: any[], filename: string) => {
    console.log(`Exporting ${filename} to Excel:`, data);
    // Implementation would use xlsx library
  };

  const exportToPDF = (data: any[], filename: string) => {
    console.log(`Exporting ${filename} to PDF:`, data);
    // Implementation would use jsPDF library
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Pharmacy Tracking Dashboard</h1>

      {/* Medicine Inventory Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Medicine Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={inventoryCategory} onValueChange={setInventoryCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {MEDICINE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={inventoryStatus} onValueChange={setInventoryStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Stock Less Than</label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={() => exportToExcel(inventoryData || [], 'medicine-inventory')} disabled={!inventoryData}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => exportToPDF(inventoryData || [], 'medicine-inventory')} disabled={!inventoryData}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {inventoryLoading && <p>Loading inventory...</p>}
          {inventoryData && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{inventoryData.length} medicines found</p>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((medicine) => (
                      <tr key={medicine.id} className="border-b">
                        <td className="p-2">{medicine.name}</td>
                        <td className="p-2">{medicine.category}</td>
                        <td className="p-2">{medicine.total_quantity}</td>
                        <td className="p-2">{medicine.expiry_date || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicine Stock History Section */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Medicine Stock History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Medicine</label>
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medicine" />
                </SelectTrigger>
                <SelectContent>
                  {medicines?.map(medicine => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      {medicine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !historyStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {historyStartDate ? format(historyStartDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={historyStartDate}
                    onSelect={setHistoryStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !historyEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {historyEndDate ? format(historyEndDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={historyEndDate}
                    onSelect={setHistoryEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => exportToExcel(stockHistoryData || [], 'stock-history')} disabled={!stockHistoryData}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => exportToPDF(stockHistoryData || [], 'stock-history')} disabled={!stockHistoryData}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {stockHistoryLoading && <p>Loading stock history...</p>}
          {stockHistoryData && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{stockHistoryData.length} records found</p>
              {/* Stock history table would go here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Reception Reports Section */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800">Patient Reception Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Search Patient</label>
            <Input
              placeholder="Search by name, ID, or phone number"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => exportToExcel(receptionReportsData || [], 'reception-reports')} disabled={!receptionReportsData}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => exportToPDF(receptionReportsData || [], 'reception-reports')} disabled={!receptionReportsData}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {receptionReportsLoading && <p>Loading reception reports...</p>}
          {receptionReportsData && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{receptionReportsData.length} reports found</p>
              {/* Reception reports table would go here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Patient & Report Count Section */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Daily Patient & Report Count</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dailyStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dailyStartDate ? format(dailyStartDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dailyStartDate}
                    onSelect={setDailyStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dailyEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dailyEndDate ? format(dailyEndDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dailyEndDate}
                    onSelect={setDailyEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => exportToExcel(dailyCountData || [], 'daily-count')} disabled={!dailyCountData}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => exportToPDF(dailyCountData || [], 'daily-count')} disabled={!dailyCountData}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {dailyCountLoading && <p>Loading daily counts...</p>}
          {dailyCountData && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{dailyCountData.length} days found</p>
              {/* Daily count table would go here */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingPage;

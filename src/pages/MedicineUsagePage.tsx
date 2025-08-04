
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, Trash2, CalendarIcon } from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { generateMedicineUsageExcel } from '@/utils/medicineUsageExcelUtils';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MedicineUsageRecord {
  id: string;
  patient_name: string;
  patient_number: number;
  report_date: string;
  medicines: Array<{
    name: string;
    quantity: number;
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  }>;
}

// Interface for the raw database query result
interface MedicineUsageQueryResult {
  id: string;
  quantity_used: number;
  usage_date: string;
  patient_id: string;
  medicine_id: string;
  patients: {
    name: string;
    patient_id: number;
  } | null;
  medicines: {
    name: string;
    category: string;
  } | null;
}

const MedicineUsagePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: medicineUsage = [], isLoading, error, refetch } = useQuery({
    queryKey: ['medicineUsage'],
    queryFn: async (): Promise<MedicineUsageQueryResult[]> => {
      console.log('Fetching medicine usage data...');
      
      const query = supabase
        .from('medicine_usage')
        .select(`
          id,
          quantity_used,
          usage_date,
          patient_id,
          medicine_id,
          patients!medicine_usage_patient_id_fkey(name, patient_id),
          medicines!medicine_usage_medicine_id_fkey(name, category)
        `)
        .order('usage_date', { ascending: false });

      console.log('Executing query...');
      const { data, error } = await query;
      if (error) {
        console.error('Medicine usage query error:', error);
        return [];
      }

      console.log('Raw query result:', data);
      return (data || []) as MedicineUsageQueryResult[];
    }
  });

  // Transform the data
  const medicineUsageRecords: MedicineUsageRecord[] = React.useMemo(() => {
    const grouped: { [key: string]: MedicineUsageRecord } = {};
    
    medicineUsage.forEach(usage => {
      if (!usage.patients || !usage.medicines) {
        console.warn('Missing patient or medicine data:', usage);
        return;
      }

      const key = `${usage.patient_id}-${usage.usage_date.split('T')[0]}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: usage.id,
          patient_name: usage.patients.name,
          patient_number: usage.patients.patient_id,
          report_date: usage.usage_date,
          medicines: []
        };
      }
      
      grouped[key].medicines.push({
        name: usage.medicines.name,
        quantity: usage.quantity_used,
        morning: false, // These would need to come from prescription data
        afternoon: false,
        evening: false,
        night: false
      });
    });
    
    return Object.values(grouped);
  }, [medicineUsage]);

  // Apply filters
  const filteredRecords = medicineUsageRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient_number.toString().includes(searchTerm) ||
      record.medicines.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const recordDate = parseISO(record.report_date);
    const matchesDateRange = (!startDate || recordDate >= startDate) && 
                            (!endDate || recordDate <= endDate);

    return matchesSearch && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportExcel = () => {
    try {
      generateMedicineUsageExcel(filteredRecords);
      toast({
        title: "Export Successful",
        description: `Exported ${filteredRecords.length} medicine usage records to Excel`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to generate Excel file"
      });
    }
  };

  const handleDeleteUsage = async (usageId: string) => {
    try {
      const { error } = await supabase
        .from('medicine_usage')
        .delete()
        .eq('id', usageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medicine usage record deleted successfully"
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete medicine usage record"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            Loading medicine usage data...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600">Error loading medicine usage data</p>
            <Button onClick={() => refetch()} className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Medicine Usage History</h1>
        <Button onClick={handleExportExcel} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export to Excel</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Filter Medicine Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search by patient name, ID, or medicine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Medicine Usage Records ({filteredRecords.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Patient ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Patient Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Medicines Used</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record, index) => (
                    <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">{record.patient_number}</td>
                      <td className="border border-gray-300 px-4 py-2">{record.patient_name}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {format(parseISO(record.report_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="space-y-1">
                          {record.medicines.map((medicine, medIndex) => (
                            <div key={medIndex} className="text-sm">
                              <span className="font-medium">{medicine.name}</span> - 
                              <span className="text-gray-600 ml-1">Qty: {medicine.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUsage(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No medicine usage records found</p>
              <p className="text-sm text-gray-400">
                Medicine usage records are automatically created when patient reports are saved with prescribed medicines.
              </p>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineUsagePage;

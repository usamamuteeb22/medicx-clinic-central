
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import MedicineUsageFilters from '@/components/usage/MedicineUsageFilters';
import MedicineUsageCard from '@/components/usage/MedicineUsageCard';
import MedicineUsagePagination from '@/components/usage/MedicineUsagePagination';
import { generateMedicineUsageExcel } from '@/utils/medicineUsageExcelUtils';
import { generateMedicineUsagePDF } from '@/utils/medicineUsagePdfUtils';
import { Download, FileText, X } from 'lucide-react';

interface MedicineUsage {
  id: string;
  patient_id: string;
  medicine_id: string;
  quantity_used: number;
  usage_date: string;
  created_by: string;
  medicine?: {
    name: string;
    category: string;
  } | null;
  patient?: {
    name: string;
    patient_id: number;
  } | null;
}

interface MedicineUsageRecord {
  id: string;
  patient_name: string;
  patient_number: number;
  report_date: string;
  medicines: {
    name: string;
    quantity: number;
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  }[];
}

const ITEMS_PER_PAGE = 20;

const MedicineUsagePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: usageData, isLoading, refetch } = useQuery({
    queryKey: ['medicine-usage', searchTerm, startDate, endDate, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('medicine_usage')
        .select(`
          *,
          medicine:medicines(name, category),
          patient:patients(name, patient_id)
        `)
        .order('usage_date', { ascending: false });

      // Apply patient name search filter
      if (searchTerm) {
        const { data: patients } = await supabase
          .from('patients')
          .select('id')
          .ilike('name', `%${searchTerm}%`);
        
        if (patients && patients.length > 0) {
          const patientIds = patients.map(p => p.id);
          query = query.in('patient_id', patientIds);
        } else {
          return { data: [], count: 0 };
        }
      }

      // Apply date filters
      if (startDate) {
        query = query.gte('usage_date', startDate.toISOString().split('T')[0]);
      }

      if (endDate) {
        query = query.lte('usage_date', endDate.toISOString().split('T')[0]);
      }

      // Get total count for pagination
      let countQuery = supabase
        .from('medicine_usage')
        .select('*', { count: 'exact', head: true });

      if (searchTerm) {
        const { data: patients } = await supabase
          .from('patients')
          .select('id')
          .ilike('name', `%${searchTerm}%`);
        
        if (patients && patients.length > 0) {
          const patientIds = patients.map(p => p.id);
          countQuery = countQuery.in('patient_id', patientIds);
        }
      }

      if (startDate) {
        countQuery = countQuery.gte('usage_date', startDate.toISOString().split('T')[0]);
      }

      if (endDate) {
        countQuery = countQuery.lte('usage_date', endDate.toISOString().split('T')[0]);
      }

      const { count } = await countQuery;

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to ensure proper typing
      const transformedData: MedicineUsage[] = (data || []).map(item => {
        // Extract medicine data safely
        const medicineData = item.medicine && typeof item.medicine === 'object' && item.medicine !== null && 'name' in item.medicine && 'category' in item.medicine
          ? item.medicine as { name: string; category: string }
          : null;

        // Extract patient data safely
        const patientData = item.patient && typeof item.patient === 'object' && item.patient !== null && 'name' in item.patient && 'patient_id' in item.patient
          ? item.patient as { name: string; patient_id: number }
          : null;

        return {
          id: item.id,
          patient_id: item.patient_id,
          medicine_id: item.medicine_id,
          quantity_used: item.quantity_used,
          usage_date: item.usage_date,
          created_by: item.created_by,
          medicine: medicineData ? { name: medicineData.name, category: medicineData.category } : null,
          patient: patientData ? { name: patientData.name, patient_id: patientData.patient_id } : null
        };
      });

      return { data: transformedData, count: count || 0 };
    }
  });

  const handleClearDates = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
    toast({
      title: "Filters Cleared",
      description: "Date filters have been cleared"
    });
  };

  // Transform data for export functions
  const transformDataForExport = (data: MedicineUsage[]): MedicineUsageRecord[] => {
    return data.map(usage => ({
      id: usage.id,
      patient_name: usage.patient?.name || 'Unknown Patient',
      patient_number: usage.patient?.patient_id || 0,
      report_date: usage.usage_date,
      medicines: [{
        name: usage.medicine?.name || 'Unknown Medicine',
        quantity: usage.quantity_used,
        morning: false,
        afternoon: false,
        evening: false,
        night: false
      }]
    }));
  };

  const handleExportExcel = () => {
    if (!usageData?.data || usageData.data.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No usage data available to export"
      });
      return;
    }

    try {
      const exportData = transformDataForExport(usageData.data);
      generateMedicineUsageExcel(exportData);
      toast({
        title: "Excel Export Successful",
        description: "Usage data has been exported to Excel"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export usage data to Excel"
      });
    }
  };

  const handleExportPDF = () => {
    if (!usageData?.data || usageData.data.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No usage data available to export"
      });
      return;
    }

    try {
      const exportData = transformDataForExport(usageData.data);
      generateMedicineUsagePDF(exportData);
      toast({
        title: "PDF Export Successful",
        description: "Usage data has been exported to PDF"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export usage data to PDF"
      });
    }
  };

  const totalPages = usageData?.count ? Math.ceil(usageData.count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Medicine Usage Tracking</h1>
        <div className="flex space-x-2">
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usage Filters</CardTitle>
            {(startDate || endDate) && (
              <Button 
                onClick={handleClearDates} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Clear Dates</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <MedicineUsageFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
          />
        </CardContent>
      </Card>

      {/* Usage Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Usage Records ({usageData?.count || 0} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading usage data...</span>
            </div>
          ) : !usageData?.data || usageData.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">
                <FileText className="h-12 w-12 mx-auto text-gray-300" />
              </div>
              <p>No usage records found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {usageData.data.map((usage) => (
                  <MedicineUsageCard
                    key={usage.id}
                    id={usage.id}
                    patientName={usage.patient?.name || 'Unknown Patient'}
                    patientNumber={usage.patient?.patient_id || 0}
                    reportDate={usage.usage_date}
                    medicines={[{
                      name: usage.medicine?.name || 'Unknown Medicine',
                      quantity: usage.quantity_used,
                      morning: false,
                      afternoon: false,
                      evening: false,
                      night: false
                    }]}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <MedicineUsagePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalRecords={usageData?.count || 0}
                    recordsPerPage={ITEMS_PER_PAGE}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineUsagePage;

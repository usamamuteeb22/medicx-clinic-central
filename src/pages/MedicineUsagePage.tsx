
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
  };
  patient?: {
    name: string;
    patient_id: number;
  };
}

const ITEMS_PER_PAGE = 20;

const MedicineUsagePage = () => {
  const [filters, setFilters] = useState({
    medicine_id: '',
    patient_name: '',
    start_date: '',
    end_date: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { data: usageData, isLoading, refetch } = useQuery({
    queryKey: ['medicine-usage', filters, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('medicine_usage')
        .select(`
          *,
          medicine:medicines(name, category),
          patient:patients(name, patient_id)
        `)
        .order('usage_date', { ascending: false });

      // Apply filters
      if (filters.medicine_id) {
        query = query.eq('medicine_id', filters.medicine_id);
      }

      if (filters.patient_name) {
        const { data: patients } = await supabase
          .from('patients')
          .select('id')
          .ilike('name', `%${filters.patient_name}%`);
        
        if (patients && patients.length > 0) {
          const patientIds = patients.map(p => p.id);
          query = query.in('patient_id', patientIds);
        } else {
          return { data: [], count: 0 };
        }
      }

      if (filters.start_date) {
        query = query.gte('usage_date', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('usage_date', filters.end_date);
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('medicine_usage')
        .select('*', { count: 'exact', head: true });

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      return { data: data as MedicineUsage[], count: count || 0 };
    }
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearDates = () => {
    const clearedFilters = {
      ...filters,
      start_date: '',
      end_date: ''
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    toast({
      title: "Filters Cleared",
      description: "Date filters have been cleared"
    });
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
      generateMedicineUsageExcel(usageData.data);
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
      generateMedicineUsagePDF(usageData.data);
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
            {(filters.start_date || filters.end_date) && (
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
            filters={filters}
            onFiltersChange={handleFilterChange}
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
                    usage={usage}
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

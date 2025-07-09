
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import MedicineUsageFilters from '@/components/usage/MedicineUsageFilters';
import MedicineUsageCard from '@/components/usage/MedicineUsageCard';
import MedicineUsagePagination from '@/components/usage/MedicineUsagePagination';
import { generateMedicineUsageExcel } from '@/utils/medicineUsageExcelUtils';

interface MedicineUsageRecord {
  id: string;
  patient_id: string;
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

const RECORDS_PER_PAGE = 10;

const MedicineUsagePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  // Optimized query with better data fetching
  const { data: usageData = { records: [], totalCount: 0 }, isLoading } = useQuery({
    queryKey: ['medicine-usage-records', currentPage, searchTerm, startDate, endDate],
    queryFn: async () => {
      console.log('Fetching medicine usage records with pagination...');
      
      // Calculate offset for pagination
      const offset = (currentPage - 1) * RECORDS_PER_PAGE;
      
      // Build the query with filters
      let reportsQuery = supabase
        .from('patient_reports')
        .select(`
          id,
          patient_id,
          report_date,
          patients!inner(name, patient_id)
        `, { count: 'exact' })
        .order('report_date', { ascending: false });

      // Apply date filters
      if (startDate) {
        reportsQuery = reportsQuery.gte('report_date', startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        reportsQuery = reportsQuery.lte('report_date', endOfDay.toISOString());
      }

      // Apply search filter
      if (searchTerm) {
        reportsQuery = reportsQuery.or(`patients.name.ilike.%${searchTerm}%,patients.patient_id.eq.${searchTerm}`);
      }

      // Apply pagination
      reportsQuery = reportsQuery.range(offset, offset + RECORDS_PER_PAGE - 1);

      const { data: reports, error, count } = await reportsQuery;

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Reports fetched:', reports?.length, 'Total count:', count);

      // Fetch prescriptions for all reports in a single query
      const reportIds = reports?.map(r => r.id) || [];
      
      let prescriptionsData: any[] = [];
      if (reportIds.length > 0) {
        const { data: prescriptions } = await supabase
          .from('medicine_prescriptions')
          .select(`
            patient_report_id,
            quantity,
            morning,
            afternoon,
            evening,
            night,
            medicines!inner(name)
          `)
          .in('patient_report_id', reportIds);
        
        prescriptionsData = prescriptions || [];
      }

      // Transform the data efficiently
      const records: MedicineUsageRecord[] = reports?.map((report: any) => {
        const reportPrescriptions = prescriptionsData.filter(p => p.patient_report_id === report.id);
        
        const medicines = reportPrescriptions.map(prescription => ({
          name: prescription.medicines?.name || 'Unknown Medicine',
          quantity: prescription.quantity || 0,
          morning: prescription.morning || false,
          afternoon: prescription.afternoon || false,
          evening: prescription.evening || false,
          night: prescription.night || false
        }));

        return {
          id: report.id,
          patient_id: report.patient_id,
          patient_name: report.patients?.name || 'Unknown Patient',
          patient_number: report.patients?.patient_id || 0,
          report_date: report.report_date || new Date().toISOString(),
          medicines
        };
      }) || [];

      return {
        records,
        totalCount: count || 0
      };
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Calculate pagination values
  const totalPages = Math.ceil(usageData.totalCount / RECORDS_PER_PAGE);

  const handleGenerateExcel = async () => {
    // For Excel generation, we might want to fetch all filtered records
    // or limit to current page data
    generateMedicineUsageExcel(usageData.records);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading medicine usage records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Medicine Usage Records</h1>
        <Button 
          onClick={handleGenerateExcel} 
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          <span>Download Excel Summary</span>
        </Button>
      </div>

      <MedicineUsageFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      {/* Medicine Usage Cards */}
      <div className="grid gap-4">
        {usageData.records.map((record) => (
          <MedicineUsageCard
            key={record.id}
            id={record.id}
            patientName={record.patient_name}
            patientNumber={record.patient_number}
            reportDate={record.report_date}
            medicines={record.medicines}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <MedicineUsagePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalRecords={usageData.totalCount}
              recordsPerPage={RECORDS_PER_PAGE}
            />
          </CardContent>
        </Card>
      )}

      {usageData.records.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No medicine usage records found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicineUsagePage;

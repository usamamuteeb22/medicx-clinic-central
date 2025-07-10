
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import { generateMedicineUsageExcel } from '@/utils/medicineUsageExcelUtils';
import { generateMedicineUsagePDF } from '@/utils/medicineUsagePdfUtils';
import MedicineUsageFilters from '@/components/usage/MedicineUsageFilters';
import MedicineUsageCard from '@/components/usage/MedicineUsageCard';
import MedicineUsagePagination from '@/components/usage/MedicineUsagePagination';

interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
}

interface MedicineUsage {
  id: string;
  medicine_id: string;
  patient_id: string;
  quantity_used: number;
  usage_date: string;
  created_by: string;
  medicine: Medicine;
  patient: Patient;
}

// Transform MedicineUsage to match MedicineUsageCard props
interface MedicineUsageCardData {
  id: string;
  patientName: string;
  patientNumber: number;
  reportDate: string;
  medicines: {
    name: string;
    quantity: number;
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  }[];
}

const MedicineUsagePage = () => {
  const [usageData, setUsageData] = useState<MedicineUsage[]>([]);
  const [filteredData, setFilteredData] = useState<MedicineUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const itemsPerPage = 12;

  useEffect(() => {
    fetchUsageData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, startDate, endDate, usageData]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching medicine usage data...');

      const { data: usageRecords, error: usageError } = await supabase
        .from('medicine_usage')
        .select('*')
        .order('usage_date', { ascending: false });

      if (usageError) {
        console.error('Error fetching usage records:', usageError);
        throw usageError;
      }

      console.log('Fetched usage records:', usageRecords?.length || 0);

      if (!usageRecords || usageRecords.length === 0) {
        setUsageData([]);
        setFilteredData([]);
        return;
      }

      // Fetch medicine and patient data for each usage record
      const enrichedUsageData = await Promise.all(
        usageRecords.map(async (usage) => {
          const [medicineResult, patientResult] = await Promise.all([
            supabase
              .from('medicines')
              .select('*')
              .eq('id', usage.medicine_id)
              .single(),
            supabase
              .from('patients')
              .select('*')
              .eq('id', usage.patient_id)
              .single()
          ]);

          return {
            ...usage,
            medicine: medicineResult.data || {
              id: usage.medicine_id || '',
              name: 'Unknown Medicine',
              category: 'unknown',
              total_quantity: 0
            },
            patient: patientResult.data || {
              id: usage.patient_id || '',
              patient_id: 0,
              name: 'Unknown Patient',
              age: 0,
              gender: 'unknown',
              phone_number: ''
            }
          };
        })
      );

      console.log('Enriched usage data:', enrichedUsageData.length);
      setUsageData(enrichedUsageData);
      setFilteredData(enrichedUsageData);

    } catch (error: any) {
      console.error('Error in fetchUsageData:', error);
      setError(error.message || 'Failed to fetch medicine usage data');
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch medicine usage data"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...usageData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patient.patient_id.toString().includes(searchTerm) ||
        item.medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filters
    if (startDate) {
      filtered = filtered.filter(item => 
        new Date(item.usage_date) >= startDate
      );
    }
    if (endDate) {
      filtered = filtered.filter(item => 
        new Date(item.usage_date) <= endDate
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Transform data for MedicineUsageCard
  const transformDataForCard = (usage: MedicineUsage): MedicineUsageCardData => {
    return {
      id: usage.id,
      patientName: usage.patient.name,
      patientNumber: usage.patient.patient_id,
      reportDate: usage.usage_date,
      medicines: [{
        name: usage.medicine.name,
        quantity: usage.quantity_used,
        morning: true, // Default values since we don't have this data
        afternoon: false,
        evening: false,
        night: false
      }]
    };
  };

  // Transform data for Excel/PDF export
  const transformDataForExport = (data: MedicineUsage[]) => {
    return data.map(usage => ({
      id: usage.id,
      patient_name: usage.patient.name,
      patient_number: usage.patient.patient_id,
      report_date: usage.usage_date,
      medicines: [{
        name: usage.medicine.name,
        quantity: usage.quantity_used,
        morning: true,
        afternoon: false,
        evening: false,
        night: false
      }]
    }));
  };

  const handleDownloadExcel = () => {
    try {
      const exportData = transformDataForExport(filteredData);
      generateMedicineUsageExcel(exportData);
      toast({
        title: "Success",
        description: "Excel file downloaded successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate Excel file"
      });
    }
  };

  const handleDownloadPDF = () => {
    try {
      const exportData = transformDataForExport(filteredData);
      generateMedicineUsagePDF(exportData);
      toast({
        title: "Success",
        description: "PDF file downloaded successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF file"
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading medicine usage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchUsageData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Usage</h1>
          <p className="text-gray-600">Track medicine consumption and usage patterns</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleDownloadExcel} 
            variant="outline" 
            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            variant="outline" 
            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <MedicineUsageFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Usage Records Found</h3>
            <p className="text-gray-500">
              {usageData.length === 0 
                ? "No medicine usage has been recorded yet." 
                : "No records match your current filter criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentData.map((usage) => {
              const cardData = transformDataForCard(usage);
              return (
                <MedicineUsageCard 
                  key={usage.id} 
                  id={cardData.id}
                  patientName={cardData.patientName}
                  patientNumber={cardData.patientNumber}
                  reportDate={cardData.reportDate}
                  medicines={cardData.medicines}
                />
              );
            })}
          </div>

          <MedicineUsagePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalRecords={filteredData.length}
            recordsPerPage={itemsPerPage}
          />
        </>
      )}
    </div>
  );
};

export default MedicineUsagePage;

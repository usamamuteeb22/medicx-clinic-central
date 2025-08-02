
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateMedicineUsageExcel } from '@/utils/medicineUsageExcelUtils';
import MedicineUsageCard from '@/components/usage/MedicineUsageCard';
import MedicineUsageFilters from '@/components/usage/MedicineUsageFilters';
import MedicineUsagePagination from '@/components/usage/MedicineUsagePagination';

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

const MedicineUsagePage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredRecords, setFilteredRecords] = useState<MedicineUsageRecord[]>([]);
  const itemsPerPage = 12;

  const { data: medicineUsage = [], isLoading } = useQuery({
    queryKey: ['medicineUsage', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('medicine_usage')
        .select(`
          id,
          quantity_used,
          usage_date,
          patient_id,
          medicine_id,
          patients!inner(name, patient_id),
          medicines!inner(name, category)
        `)
        .order('usage_date', { ascending: false });

      if (startDate) {
        query = query.gte('usage_date', startDate);
      }
      if (endDate) {
        query = query.lte('usage_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by patient and date
      const grouped: { [key: string]: MedicineUsageRecord } = {};
      
      data?.forEach(usage => {
        const key = `${usage.patient_id}-${usage.usage_date.split('T')[0]}`;
        if (!grouped[key]) {
          grouped[key] = {
            id: usage.id,
            patient_name: usage.patients?.name || 'Unknown',
            patient_number: usage.patients?.patient_id || 0,
            report_date: usage.usage_date,
            medicines: []
          };
        }
        
        grouped[key].medicines.push({
          name: usage.medicines?.name || 'Unknown Medicine',
          quantity: usage.quantity_used,
          morning: false, // These would need to come from prescription data
          afternoon: false,
          evening: false,
          night: false
        });
      });

      return Object.values(grouped);
    }
  });

  useEffect(() => {
    let filtered = medicineUsage;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient_number.toString().includes(searchTerm) ||
        record.medicines.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      // Note: Category filtering would need medicine category data from the query
      filtered = filtered;
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [medicineUsage, searchTerm, selectedCategory]);

  const handleExportExcel = () => {
    try {
      generateMedicineUsageExcel(filteredRecords);
      toast({
        title: "Export Successful",
        description: "Medicine usage data has been exported to Excel successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export medicine usage data to Excel."
      });
    }
  };

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Medicine Usage Reports</h1>
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <MedicineUsageFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={handleExportExcel} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download Excel</span>
        </Button>
      </div>

      {/* Usage Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRecords.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRecords.map((record) => (
              <MedicineUsageCard key={record.id} record={record} />
            ))}
          </div>
          
          <MedicineUsagePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No medicine usage records found for the selected criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicineUsagePage;

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
interface RawMedicineUsage {
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<MedicineUsageRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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
          patients(name, patient_id),
          medicines(name, category)
        `)
        .order('usage_date', { ascending: false });

      if (startDate) {
        query = query.gte('usage_date', startDate);
      }
      if (endDate) {
        query = query.lte('usage_date', endDate);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Medicine usage query error:', error);
        // Return empty array if there's an error to prevent crashes
        return [];
      }

      // Type assertion with proper error handling
      return (data || []) as unknown as RawMedicineUsage[];
    }
  });

  useEffect(() => {
    // Group by patient and date
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

    let filtered = Object.values(grouped);

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient_number.toString().includes(searchTerm) ||
        record.medicines.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [medicineUsage, searchTerm]);

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

      {/* Search Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">Search by Patient Name, ID, or Medicine</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

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
              <Card key={record.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{record.patient_name}</h3>
                        <p className="text-sm text-gray-600">Patient ID: {record.patient_number}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {new Date(record.report_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Medicines Used:</h4>
                      {record.medicines.map((medicine, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="truncate">{medicine.name}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            Qty: {medicine.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
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

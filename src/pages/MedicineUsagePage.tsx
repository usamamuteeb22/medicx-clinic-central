
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Search, Calendar, User, Pill } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateMedicineUsageExcel } from '@/utils/medicineUsageExcelUtils';
import { generateMedicineUsagePDF } from '@/utils/medicineUsagePdfUtils';
import MedicineUsagePagination from '@/components/usage/MedicineUsagePagination';

interface Patient {
  id: string;
  name: string;
  patient_id: number;
  age: number;
  gender: string;
  phone_number?: string;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
}

interface MedicineUsage {
  id: string;
  medicine_id: string;
  patient_id: string;
  quantity_used: number;
  usage_date: string;
  created_by: string;
  medicine?: Medicine;
  patient?: Patient;
}

interface GroupedUsageReport {
  reportDate: string;
  patient: Patient;
  medicines: Array<{
    medicine: Medicine;
    quantity: number;
  }>;
  totalMedicines: number;
}

const MedicineUsagePage = () => {
  const { user } = useAuth();
  const [usageRecords, setUsageRecords] = useState<MedicineUsage[]>([]);
  const [groupedReports, setGroupedReports] = useState<GroupedUsageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsageData();
  }, []);

  useEffect(() => {
    groupUsageData();
  }, [usageRecords, searchTerm, dateFilter]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      
      // First get medicine usage records
      const { data: usageData, error: usageError } = await supabase
        .from('medicine_usage')
        .select('*')
        .order('usage_date', { ascending: false });

      if (usageError) throw usageError;

      if (!usageData || usageData.length === 0) {
        setUsageRecords([]);
        return;
      }

      // Get unique medicine IDs and patient IDs
      const medicineIds = [...new Set(usageData.map(record => record.medicine_id).filter(Boolean))];
      const patientIds = [...new Set(usageData.map(record => record.patient_id).filter(Boolean))];

      // Fetch medicines
      const { data: medicinesData } = await supabase
        .from('medicines')
        .select('*')
        .in('id', medicineIds);

      // Fetch patients
      const { data: patientsData } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds);

      // Create lookup maps
      const medicinesMap = new Map(medicinesData?.map(med => [med.id, med]) || []);
      const patientsMap = new Map(patientsData?.map(pat => [pat.id, pat]) || []);

      // Combine the data
      const enrichedUsageData = usageData.map(record => ({
        ...record,
        medicine: medicinesMap.get(record.medicine_id!),
        patient: patientsMap.get(record.patient_id!)
      })).filter(record => record.medicine && record.patient);

      setUsageRecords(enrichedUsageData as MedicineUsage[]);
    } catch (error: any) {
      console.error('Error fetching usage data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch medicine usage data"
      });
    } finally {
      setLoading(false);
    }
  };

  const groupUsageData = () => {
    let filteredRecords = usageRecords;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.patient?.name.toLowerCase().includes(searchLower) ||
        record.medicine?.name.toLowerCase().includes(searchLower) ||
        record.patient?.patient_id.toString().includes(searchTerm)
      );
    }

    // Apply date filter
    if (dateFilter) {
      filteredRecords = filteredRecords.filter(record => 
        record.usage_date.startsWith(dateFilter)
      );
    }

    // Group by patient and date
    const grouped = filteredRecords.reduce((acc, record) => {
      if (!record.patient || !record.medicine) return acc;
      
      const key = `${record.patient_id}-${record.usage_date.split('T')[0]}`;
      
      if (!acc[key]) {
        acc[key] = {
          reportDate: record.usage_date,
          patient: record.patient,
          medicines: [],
          totalMedicines: 0
        };
      }

      acc[key].medicines.push({
        medicine: record.medicine,
        quantity: record.quantity_used
      });
      acc[key].totalMedicines += record.quantity_used;

      return acc;
    }, {} as Record<string, GroupedUsageReport>);

    const groupedArray = Object.values(grouped).sort((a, b) => 
      new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
    );

    setGroupedReports(groupedArray);
  };

  const handleExportExcel = () => {
    const exportData = usageRecords
      .filter(record => record.patient && record.medicine)
      .map(record => ({
        id: record.id,
        patient_name: record.patient!.name,
        patient_number: record.patient!.patient_id,
        report_date: record.usage_date,
        medicines: [{
          name: record.medicine!.name,
          quantity: record.quantity_used,
          morning: false,
          afternoon: false,
          evening: false,
          night: false
        }]
      }));
    
    generateMedicineUsageExcel(exportData);
  };

  const handleGeneratePDF = () => {
    const exportData = usageRecords
      .filter(record => record.patient && record.medicine)
      .map(record => ({
        id: record.id,
        patient_name: record.patient!.name,
        patient_number: record.patient!.patient_id,
        report_date: record.usage_date,
        medicines: [{
          name: record.medicine!.name,
          quantity: record.quantity_used,
          morning: false,
          afternoon: false,
          evening: false,
          night: false
        }]
      }));
    
    generateMedicineUsagePDF(exportData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Pagination
  const totalPages = Math.ceil(groupedReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = groupedReports.slice(startIndex, startIndex + itemsPerPage);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access medicine usage data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Usage Reports</h1>
          <p className="text-gray-600">Track and monitor medicine consumption by patients</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportExcel} variant="outline" className="flex items-center space-x-2">
            <FileDown className="h-4 w-4" />
            <span>Export Excel</span>
          </Button>
          <Button onClick={handleGeneratePDF} variant="outline" className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Generate PDF</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <input
                type="text"
                placeholder="Search by patient name, medicine name, or patient ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Reports */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">Loading medicine usage data...</div>
          </CardContent>
        </Card>
      ) : paginatedReports.length > 0 ? (
        <div className="space-y-4">
          {paginatedReports.map((report, index) => (
            <Card key={`${report.patient.id}-${report.reportDate}-${index}`} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-semibold">{report.patient.name}</div>
                      <div className="text-sm text-gray-500">ID: {report.patient.patient_id}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-semibold">Usage Date</div>
                      <div className="text-sm text-gray-500">{formatDate(report.reportDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Pill className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="font-semibold">Total Medicines</div>
                      <div className="text-sm text-gray-500">{report.totalMedicines} units</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 mb-3">Prescribed Medicines:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {report.medicines.map((medicineItem, medIndex) => (
                      <div key={`${medicineItem.medicine.id}-${medIndex}`} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-800">{medicineItem.medicine.name}</div>
                        <div className="text-sm text-gray-600">Category: {medicineItem.medicine.category}</div>
                        <div className="text-sm font-semibold text-blue-600">Quantity: {medicineItem.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">No medicine usage records found.</div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <MedicineUsagePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRecords={groupedReports.length}
          recordsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};

export default MedicineUsagePage;

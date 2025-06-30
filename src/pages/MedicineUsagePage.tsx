import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import MedicineUsageFilters from '@/components/usage/MedicineUsageFilters';
import MedicineUsageCard from '@/components/usage/MedicineUsageCard';
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

const MedicineUsagePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data: usageRecords = [], isLoading } = useQuery({
    queryKey: ['medicine-usage-records'],
    queryFn: async () => {
      console.log('Fetching medicine usage records...');
      
      // Fetch patient reports with their prescribed medicines
      const { data: reports, error } = await supabase
        .from('patient_reports')
        .select(`
          id,
          patient_id,
          report_date
        `)
        .order('report_date', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Raw reports data:', reports);

      // Transform the data to group by individual reports
      const records: MedicineUsageRecord[] = await Promise.all(
        reports?.map(async (report) => {
          // Fetch patient data separately
          const { data: patientData } = await supabase
            .from('patients')
            .select('name, patient_id')
            .eq('id', report.patient_id)
            .single();

          // Fetch medicine prescriptions for this report
          const { data: prescriptions } = await supabase
            .from('medicine_prescriptions')
            .select('quantity, morning, afternoon, evening, night, medicine_id')
            .eq('patient_report_id', report.id);

          // Fetch medicine details for each prescription
          const medicines = await Promise.all(
            prescriptions?.map(async (prescription) => {
              const { data: medicineData } = await supabase
                .from('medicines')
                .select('name')
                .eq('id', prescription.medicine_id)
                .single();

              return {
                name: medicineData?.name || 'Unknown Medicine',
                quantity: prescription.quantity || 0,
                morning: prescription.morning || false,
                afternoon: prescription.afternoon || false,
                evening: prescription.evening || false,
                night: prescription.night || false
              };
            }) || []
          );

          return {
            id: report.id,
            patient_id: report.patient_id,
            patient_name: patientData?.name || 'Unknown Patient',
            patient_number: patientData?.patient_id || 0,
            report_date: report.report_date || new Date().toISOString(),
            medicines
          };
        }) || []
      );

      console.log('Transformed records:', records);
      return records;
    }
  });

  const filteredRecords = usageRecords.filter(record => {
    const matchesSearch = 
      record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient_number.toString().includes(searchTerm);
    
    const recordDate = new Date(record.report_date);
    const matchesDateRange = (() => {
      if (startDate && endDate) {
        return recordDate >= startDate && recordDate <= endDate;
      }
      if (startDate) {
        return recordDate >= startDate;
      }
      if (endDate) {
        return recordDate <= endDate;
      }
      return true;
    })();

    return matchesSearch && matchesDateRange;
  });

  const handleGenerateExcel = async () => {
    generateMedicineUsageExcel(filteredRecords);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading medicine usage records...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Medicine Usage Records</h1>
        <Button onClick={handleGenerateExcel} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
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
        {filteredRecords.map((record) => (
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

      {filteredRecords.length === 0 && (
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

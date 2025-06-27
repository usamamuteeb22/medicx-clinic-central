
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import MedicineUsageFilters from '@/components/usage/MedicineUsageFilters';
import MedicineUsageCard from '@/components/usage/MedicineUsageCard';
import { generateMedicineUsagePDF } from '@/utils/medicineUsagePdfUtils';

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
          report_date,
          patients!inner(
            name,
            patient_id
          ),
          medicine_prescriptions(
            quantity,
            morning,
            afternoon,
            evening,
            night,
            medicines(
              name
            )
          )
        `)
        .order('report_date', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Raw reports data:', reports);

      // Transform the data to group by individual reports
      const records: MedicineUsageRecord[] = reports?.map(report => ({
        id: report.id,
        patient_id: report.patient_id,
        patient_name: report.patients?.name || 'Unknown Patient',
        patient_number: report.patients?.patient_id || 0,
        report_date: report.report_date || new Date().toISOString(),
        medicines: report.medicine_prescriptions?.map(prescription => ({
          name: prescription.medicines?.name || 'Unknown Medicine',
          quantity: prescription.quantity || 0,
          morning: prescription.morning || false,
          afternoon: prescription.afternoon || false,
          evening: prescription.evening || false,
          night: prescription.night || false
        })) || []
      })) || [];

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

  const handleGeneratePDF = async () => {
    generateMedicineUsagePDF(filteredRecords);
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
        <Button onClick={handleGeneratePDF} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download PDF Summary</span>
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

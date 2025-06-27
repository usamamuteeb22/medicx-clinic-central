
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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

  const generatePDF = async () => {
    const filteredData = filteredRecords.map(record => ({
      patientName: record.patient_name,
      patientId: record.patient_number,
      reportDate: format(new Date(record.report_date), 'MMM dd, yyyy'),
      reportTime: format(new Date(record.report_date), 'hh:mm:ss a'),
      medicines: record.medicines.map(med => ({
        name: med.name,
        quantity: med.quantity,
        timing: [
          med.morning && 'Morning',
          med.afternoon && 'Afternoon', 
          med.evening && 'Evening',
          med.night && 'Night'
        ].filter(Boolean).join(', ')
      }))
    }));

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medicine Usage Summary Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .record { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; }
            .patient-info { font-weight: bold; margin-bottom: 10px; }
            .medicine-item { margin: 5px 0; padding: 5px; background: #f9f9f9; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Medicine Usage Summary Report</h1>
          <p><strong>Generated on:</strong> ${format(new Date(), 'MMM dd, yyyy hh:mm:ss a')}</p>
          ${filteredData.map(record => `
            <div class="record">
              <div class="patient-info">
                Patient: ${record.patientName} (ID: ${record.patientId})<br>
                Report Date: ${record.reportDate} at ${record.reportTime}
              </div>
              <h4>Prescribed Medicines:</h4>
              ${record.medicines.map(med => `
                <div class="medicine-item">
                  • ${med.name} (Qty: ${med.quantity}) - ${med.timing || 'Not specified'}
                </div>
              `).join('')}
            </div>
          `).join('')}
          <p><strong>Total Records:</strong> ${filteredData.length}</p>
        </body>
      </html>
    `;

    // Create and download PDF
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicine-usage-summary-${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <Button onClick={generatePDF} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download PDF Summary</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Starting Date</label>
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
                      {startDate ? format(startDate, "PPP") : "Select start date"}
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
              
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Ending Date</label>
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
                      {endDate ? format(endDate, "PPP") : "Select end date"}
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
            
            <div className="flex gap-2">
              {startDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStartDate(undefined)}
                >
                  Clear Start Date
                </Button>
              )}
              {endDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEndDate(undefined)}
                >
                  Clear End Date
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicine Usage Cards */}
      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{record.patient_name}</CardTitle>
                  <p className="text-sm text-gray-600">Patient ID: {record.patient_number}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {format(new Date(record.report_date), 'MMM dd, yyyy')}
                  </Badge>
                  <p className="text-sm text-gray-500">
                    {format(new Date(record.report_date), 'hh:mm:ss a')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Prescribed Medicines:</h4>
                <div className="grid gap-2">
                  {record.medicines.map((medicine, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-sm text-gray-600 ml-2">Qty: {medicine.quantity}</span>
                      </div>
                      <div className="flex space-x-1">
                        {medicine.morning && <Badge variant="secondary" className="text-xs">Morning</Badge>}
                        {medicine.afternoon && <Badge variant="secondary" className="text-xs">Afternoon</Badge>}
                        {medicine.evening && <Badge variant="secondary" className="text-xs">Evening</Badge>}
                        {medicine.night && <Badge variant="secondary" className="text-xs">Night</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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

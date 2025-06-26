
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data: usageRecords = [], isLoading } = useQuery({
    queryKey: ['medicine-usage-records'],
    queryFn: async () => {
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

      if (error) throw error;

      // Transform the data to group by individual reports
      const records: MedicineUsageRecord[] = reports.map(report => ({
        id: report.id,
        patient_id: report.patient_id,
        patient_name: report.patients.name,
        patient_number: report.patients.patient_id,
        report_date: report.report_date,
        medicines: report.medicine_prescriptions.map(prescription => ({
          name: prescription.medicines.name,
          quantity: prescription.quantity,
          morning: prescription.morning,
          afternoon: prescription.afternoon,
          evening: prescription.evening,
          night: prescription.night
        }))
      }));

      return records;
    }
  });

  const filteredRecords = usageRecords.filter(record => {
    const matchesSearch = 
      record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient_number.toString().includes(searchTerm);
    
    const matchesDate = selectedDate ? 
      format(new Date(record.report_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') : 
      true;

    return matchesSearch && matchesDate;
  });

  const generatePDF = () => {
    const filteredData = filteredRecords.map(record => ({
      patientName: record.patient_name,
      patientId: record.patient_number,
      reportDate: format(new Date(record.report_date), 'MMM dd, yyyy'),
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

    const pdfContent = `
Medicine Usage Summary Report
Generated on: ${format(new Date(), 'MMM dd, yyyy')}

${filteredData.map(record => `
Patient: ${record.patientName} (ID: ${record.patientId})
Report Date: ${record.reportDate}
Medicines:
${record.medicines.map(med => `  - ${med.name} (Qty: ${med.quantity}) - ${med.timing}`).join('\n')}
`).join('\n---\n')}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicine-usage-summary-${format(new Date(), 'yyyy-MM-dd')}.txt`;
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button
                variant="outline"
                onClick={() => setSelectedDate(undefined)}
              >
                Clear Date
              </Button>
            )}
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
                <Badge variant="outline">
                  {format(new Date(record.report_date), 'MMM dd, yyyy')}
                </Badge>
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

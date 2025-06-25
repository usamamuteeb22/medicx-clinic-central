
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Calendar, Pill, Download, User } from 'lucide-react';

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
}

interface MedicineUsage {
  id: string;
  patient_id: string;
  medicine_id: string;
  quantity_used: number;
  usage_date: string;
  created_by: string;
  patient: Patient;
  medicine: Medicine;
}

interface PrescriptionDetail {
  medicine_name: string;
  quantity: number;
  morning: boolean;
  evening: boolean;
  night: boolean;
}

interface UsageCardData extends MedicineUsage {
  prescriptions: PrescriptionDetail[];
}

const MedicineUsagePage = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [medicineUsageData, setMedicineUsageData] = useState<UsageCardData[]>([]);
  const [loading, setLoading] = useState(false);

  // Check user permissions
  const canAccessPage = user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'pharmacy';

  if (!canAccessPage) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only Admin, Doctor, and Pharmacy users can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Fetch data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchMedicineUsage();
    }
  }, [startDate, endDate]);

  const fetchMedicineUsage = async () => {
    setLoading(true);
    try {
      // First, get medicine usage data
      const { data: usageData, error: usageError } = await supabase
        .from('medicine_usage')
        .select(`
          *,
          patient:patients(*),
          medicine:medicines(*)
        `)
        .gte('usage_date', startDate)
        .lte('usage_date', endDate + 'T23:59:59')
        .order('usage_date', { ascending: false });

      if (usageError) throw usageError;

      // Group by patient and usage date to get prescription details
      const groupedData: { [key: string]: UsageCardData } = {};

      for (const usage of usageData || []) {
        const key = `${usage.patient_id}_${usage.usage_date.split('T')[0]}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            ...usage,
            prescriptions: []
          };
        }

        // Find prescription details for this medicine usage
        const { data: prescriptionData, error: prescriptionError } = await supabase
          .from('medicine_prescriptions')
          .select(`
            quantity,
            morning,
            evening,
            night,
            medicine:medicines(name),
            patient_report:patient_reports(usage_date:created_at)
          `)
          .eq('medicine_id', usage.medicine_id)
          .eq('patient_report.patient_id', usage.patient_id)
          .gte('patient_report.created_at', usage.usage_date.split('T')[0])
          .lte('patient_report.created_at', usage.usage_date.split('T')[0] + 'T23:59:59')
          .limit(1);

        if (!prescriptionError && prescriptionData && prescriptionData.length > 0) {
          const prescription = prescriptionData[0];
          groupedData[key].prescriptions.push({
            medicine_name: usage.medicine.name,
            quantity: usage.quantity_used,
            morning: prescription.morning,
            evening: prescription.evening,
            night: prescription.night
          });
        } else {
          // Fallback if prescription details not found
          groupedData[key].prescriptions.push({
            medicine_name: usage.medicine.name,
            quantity: usage.quantity_used,
            morning: false,
            evening: false,
            night: false
          });
        }
      }

      setMedicineUsageData(Object.values(groupedData));
    } catch (error) {
      console.error('Error fetching medicine usage:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch medicine usage data"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDFSummary = () => {
    // Create a printable summary
    const printContent = `
      <html>
        <head>
          <title>Medicine Usage Summary</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .date-range { margin-bottom: 20px; font-weight: bold; }
            .usage-card { border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; border-radius: 5px; }
            .patient-info { margin-bottom: 10px; }
            .medicine-list { margin-top: 10px; }
            .medicine-item { margin: 5px 0; padding-left: 15px; }
            .dose-times { font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MEDICX CLINIC</h1>
            <h2>Medicine Usage Summary</h2>
          </div>
          <div class="date-range">
            Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}
          </div>
          ${medicineUsageData.map(usage => `
            <div class="usage-card">
              <div class="patient-info">
                <strong>Patient:</strong> ${usage.patient.name} (ID: ${usage.patient.patient_id})<br>
                <strong>Age:</strong> ${usage.patient.age} | 
                <strong>Phone:</strong> ${usage.patient.phone_number || 'N/A'}<br>
                <strong>Date:</strong> ${new Date(usage.usage_date).toLocaleDateString()}
              </div>
              <div class="medicine-list">
                <strong>Prescribed Medicines:</strong>
                ${usage.prescriptions.map(med => `
                  <div class="medicine-item">
                    • ${med.medicine_name} - Quantity: ${med.quantity}
                    <div class="dose-times">
                      Dose Times: ${[
                        med.morning ? 'Morning' : '',
                        med.evening ? 'Evening' : '',
                        med.night ? 'Night' : ''
                      ].filter(Boolean).join(', ') || 'Not specified'}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getDosageText = (prescription: PrescriptionDetail) => {
    const times = [];
    if (prescription.morning) times.push('Morning');
    if (prescription.evening) times.push('Evening');
    if (prescription.night) times.push('Night');
    return times.length > 0 ? times.join(', ') : 'Not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Usage History</h1>
          <p className="text-gray-600">Track prescribed medicines and stock deductions</p>
        </div>
        <Button
          onClick={generatePDFSummary}
          className="flex items-center space-x-2"
          disabled={medicineUsageData.length === 0}
        >
          <Download className="h-4 w-4" />
          <span>Download PDF Summary</span>
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Date Range Filter</span>
          </CardTitle>
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

      {/* Medicine Usage Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5" />
            <span>Medicine Usage Records</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading medicine usage data...</div>
          ) : medicineUsageData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No medicine usage records found for the selected date range
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicineUsageData.map((usage) => (
                <Card key={usage.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">Patient Details</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="font-medium">ID:</span> {usage.patient.patient_id}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Name:</span> {usage.patient.name}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Age:</span> {usage.patient.age}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Phone:</span> {usage.patient.phone_number || 'N/A'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Date:</span> {formatDate(usage.usage_date)}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Pill className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-900">Prescribed Medicines</span>
                      </div>
                      
                      <div className="space-y-2">
                        {usage.prescriptions.map((prescription, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="font-medium">{prescription.medicine_name}</div>
                            <div className="text-gray-600">Quantity: {prescription.quantity}</div>
                            <div className="text-gray-500 text-xs">
                              Dose: {getDosageText(prescription)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineUsagePage;

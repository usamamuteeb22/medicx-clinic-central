
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Medicine {
  name: string;
  quantity: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

interface MedicineUsageCardProps {
  id: string;
  patientName: string;
  patientNumber: number;
  reportDate: string;
  medicines: Medicine[];
}

const MedicineUsageCard = ({
  patientName,
  patientNumber,
  reportDate,
  medicines
}: MedicineUsageCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{patientName}</CardTitle>
            <p className="text-sm text-gray-600">Patient ID: {patientNumber}</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-1">
              {format(new Date(reportDate), 'MMM dd, yyyy')}
            </Badge>
            <p className="text-sm text-gray-500">
              {format(new Date(reportDate), 'hh:mm:ss a')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Prescribed Medicines:</h4>
          <div className="grid gap-2">
            {medicines.map((medicine, index) => (
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
  );
};

export default MedicineUsageCard;

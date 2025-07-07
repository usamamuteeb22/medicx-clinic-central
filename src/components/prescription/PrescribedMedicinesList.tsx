
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
}

interface DoctorPrescribedMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  morning: boolean;
  afternoon?: boolean;
  evening: boolean;
  night: boolean;
}

interface PrescribedMedicinesListProps {
  prescribedMedicines: DoctorPrescribedMedicine[];
  onRemoveMedicine: (id: string) => void;
}

const PrescribedMedicinesList: React.FC<PrescribedMedicinesListProps> = ({
  prescribedMedicines,
  onRemoveMedicine
}) => {
  const getTimingBadges = (medicine: DoctorPrescribedMedicine) => {
    const timings = [];
    if (medicine.morning) timings.push('Morning');
    if (medicine.afternoon) timings.push('Afternoon');
    if (medicine.evening) timings.push('Evening');
    if (medicine.night) timings.push('Night');
    return timings;
  };

  if (prescribedMedicines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescribed Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No medicines prescribed yet. Add some medicines above.
          </div>
        </CardContent>
      </Card>
    );  
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescribed Medicines ({prescribedMedicines.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prescribedMedicines.map((prescribedMedicine) => (
            <div
              key={prescribedMedicine.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium">{prescribedMedicine.medicine.name}</h4>
                  <Badge variant="outline">
                    {prescribedMedicine.medicine.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Qty: {prescribedMedicine.quantity}</span>
                  <div className="flex gap-1">
                    {getTimingBadges(prescribedMedicine).map((timing) => (
                      <Badge key={timing} variant="secondary" className="text-xs">
                        {timing}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMedicine(prescribedMedicine.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrescribedMedicinesList;

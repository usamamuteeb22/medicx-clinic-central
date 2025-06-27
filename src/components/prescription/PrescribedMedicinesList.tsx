
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pill, Trash2 } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
}

interface PrescribedMedicine {
  id: string;
  medicine: Medicine;
  quantity: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

interface PrescribedMedicinesListProps {
  prescribedMedicines: PrescribedMedicine[];
  onRemoveMedicine: (id: string) => void;
}

const PrescribedMedicinesList: React.FC<PrescribedMedicinesListProps> = ({
  prescribedMedicines,
  onRemoveMedicine
}) => {
  const getDosageText = (medicine: PrescribedMedicine) => {
    const times = [];
    if (medicine.morning) times.push('Morning');
    if (medicine.afternoon) times.push('Afternoon');
    if (medicine.evening) times.push('Evening');
    if (medicine.night) times.push('Night');
    return times.length > 0 ? times.join(', ') : 'Not specified';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pill className="h-4 w-4" />
          <span>Prescribed Medicines ({prescribedMedicines.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prescribedMedicines.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No medicines prescribed yet</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Dosage Timing</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescribedMedicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.medicine.name}</TableCell>
                    <TableCell className="capitalize">{medicine.medicine.category}</TableCell>
                    <TableCell>{medicine.quantity}</TableCell>
                    <TableCell>{getDosageText(medicine)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveMedicine(medicine.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrescribedMedicinesList;

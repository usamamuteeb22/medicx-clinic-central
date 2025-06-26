
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Pill } from 'lucide-react';

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

interface MedicinePrescriptionFormProps {
  prescribedMedicines: PrescribedMedicine[];
  onPrescribedMedicinesChange: (medicines: PrescribedMedicine[]) => void;
}

const MedicinePrescriptionForm: React.FC<MedicinePrescriptionFormProps> = ({
  prescribedMedicines,
  onPrescribedMedicinesChange
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dosageTiming, setDosageTiming] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .gt('total_quantity', 0)
        .order('name');

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch medicines"
      });
    }
  };

  const handleAddMedicine = () => {
    if (!selectedMedicineId || !quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a medicine and enter quantity"
      });
      return;
    }

    const selectedMedicine = medicines.find(m => m.id === selectedMedicineId);
    if (!selectedMedicine) return;

    if (parseInt(quantity) > selectedMedicine.total_quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Insufficient stock. Available: ${selectedMedicine.total_quantity}`
      });
      return;
    }

    // Check if medicine already prescribed
    if (prescribedMedicines.some(pm => pm.medicine.id === selectedMedicineId)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Medicine already prescribed"
      });
      return;
    }

    const newPrescription: PrescribedMedicine = {
      id: crypto.randomUUID(),
      medicine: selectedMedicine,
      quantity: parseInt(quantity),
      morning: dosageTiming.morning,
      afternoon: dosageTiming.afternoon,
      evening: dosageTiming.evening,
      night: dosageTiming.night
    };

    onPrescribedMedicinesChange([...prescribedMedicines, newPrescription]);

    // Reset form
    setSelectedMedicineId('');
    setQuantity('');
    setDosageTiming({
      morning: false,
      afternoon: false,
      evening: false,
      night: false
    });
  };

  const handleRemoveMedicine = (id: string) => {
    onPrescribedMedicinesChange(prescribedMedicines.filter(pm => pm.id !== id));
  };

  const getDosageText = (medicine: PrescribedMedicine) => {
    const times = [];
    if (medicine.morning) times.push('Morning');
    if (medicine.afternoon) times.push('Afternoon');
    if (medicine.evening) times.push('Evening');
    if (medicine.night) times.push('Night');
    return times.length > 0 ? times.join(', ') : 'Not specified';
  };

  return (
    <div className="space-y-6">
      {/* Add Medicine Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Medicine Prescription</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Medicine</Label>
              <Select value={selectedMedicineId} onValueChange={setSelectedMedicineId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose medicine" />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      {medicine.name} - Stock: {medicine.total_quantity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dosage Timing</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="morning"
                  checked={dosageTiming.morning}
                  onCheckedChange={(checked) => 
                    setDosageTiming({...dosageTiming, morning: !!checked})
                  }
                />
                <Label htmlFor="morning">Morning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="afternoon"
                  checked={dosageTiming.afternoon}
                  onCheckedChange={(checked) => 
                    setDosageTiming({...dosageTiming, afternoon: !!checked})
                  }
                />
                <Label htmlFor="afternoon">Afternoon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="evening"
                  checked={dosageTiming.evening}
                  onCheckedChange={(checked) => 
                    setDosageTiming({...dosageTiming, evening: !!checked})
                  }
                />
                <Label htmlFor="evening">Evening</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="night"
                  checked={dosageTiming.night}
                  onCheckedChange={(checked) => 
                    setDosageTiming({...dosageTiming, night: !!checked})
                  }
                />
                <Label htmlFor="night">Night</Label>
              </div>
            </div>
          </div>

          <Button onClick={handleAddMedicine} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </CardContent>
      </Card>

      {/* Prescribed Medicines List */}
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
                          onClick={() => handleRemoveMedicine(medicine.id)}
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
    </div>
  );
};

export default MedicinePrescriptionForm;

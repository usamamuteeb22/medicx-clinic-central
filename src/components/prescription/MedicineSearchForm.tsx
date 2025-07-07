
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Search, Plus } from 'lucide-react';

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

interface MedicineSearchFormProps {
  reportId?: string;
  prescribedMedicines: DoctorPrescribedMedicine[];
  onAddMedicine: (medicine: DoctorPrescribedMedicine) => void;
}

const MedicineSearchForm: React.FC<MedicineSearchFormProps> = ({
  reportId,
  prescribedMedicines,
  onAddMedicine
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState('');
  const [morning, setMorning] = useState(false);
  const [afternoon, setAfternoon] = useState(false);
  const [evening, setEvening] = useState(false);
  const [night, setNight] = useState(false);

  // Fetch medicines based on search query
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines-search', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('medicines')
        .select('id, name, category, total_quantity')
        .gt('total_quantity', 0)
        .order('name');

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      return data || [];
    }
  });

  const handleAddMedicine = () => {
    if (!selectedMedicine) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a medicine"
      });
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid quantity"
      });
      return;
    }

    if (!morning && !afternoon && !evening && !night) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one time for medication"
      });
      return;
    }

    // Check if medicine is already prescribed
    const alreadyPrescribed = prescribedMedicines.some(
      pm => pm.medicine.id === selectedMedicine.id
    );

    if (alreadyPrescribed) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This medicine is already prescribed"
      });
      return;
    }

    const newPrescription: DoctorPrescribedMedicine = {
      id: `temp-${Date.now()}`,
      medicine: selectedMedicine,
      quantity: parseInt(quantity),
      morning,
      afternoon,
      evening,
      night
    };

    onAddMedicine(newPrescription);

    // Reset form
    setSelectedMedicine(null);
    setQuantity('');
    setMorning(false);
    setAfternoon(false);
    setEvening(false);
    setNight(false);
    setSearchQuery('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Medicine Prescription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Medicine Search */}
        <div className="space-y-2">
          <Label htmlFor="medicineSearch">Search Medicine</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="medicineSearch"
              placeholder="Type medicine name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Medicine Selection */}
        {medicines && medicines.length > 0 && (
          <div className="space-y-2">
            <Label>Select Medicine</Label>
            <Select
              value={selectedMedicine?.id || ''}
              onValueChange={(value) => {
                const medicine = medicines.find(m => m.id === value);
                setSelectedMedicine(medicine || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a medicine" />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((medicine) => (
                  <SelectItem key={medicine.id} value={medicine.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{medicine.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        Stock: {medicine.total_quantity}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
        </div>

        {/* Timing */}
        <div className="space-y-2">
          <Label>When to take</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="morning"
                checked={morning}
                onCheckedChange={setMorning}
              />
              <Label htmlFor="morning">Morning</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="afternoon"
                checked={afternoon}
                onCheckedChange={setAfternoon}
              />
              <Label htmlFor="afternoon">Afternoon</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="evening"
                checked={evening}
                onCheckedChange={setEvening}
              />
              <Label htmlFor="evening">Evening</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="night"
                checked={night}
                onCheckedChange={setNight}
              />
              <Label htmlFor="night">Night</Label>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <Button 
          onClick={handleAddMedicine}
          className="w-full"
          disabled={!selectedMedicine || !quantity}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </CardContent>
    </Card>
  );
};

export default MedicineSearchForm;

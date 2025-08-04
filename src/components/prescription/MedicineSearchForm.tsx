
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  days: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  before_meal: boolean;
  after_meal: boolean;
  fasting: boolean;
  note?: string;
}

interface MedicineSearchFormProps {
  prescribedMedicines: PrescribedMedicine[];
  onAddMedicine: (medicine: PrescribedMedicine) => void;
}

const MedicineSearchForm: React.FC<MedicineSearchFormProps> = ({
  prescribedMedicines,
  onAddMedicine
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [days, setDays] = useState<number>(1);
  const [morning, setMorning] = useState(false);
  const [afternoon, setAfternoon] = useState(false);
  const [evening, setEvening] = useState(false);
  const [night, setNight] = useState(false);
  const [beforeMeal, setBeforeMeal] = useState(false);
  const [afterMeal, setAfterMeal] = useState(false);
  const [fasting, setFasting] = useState(false);
  const [note, setNote] = useState('');
  const [calculatedQuantity, setCalculatedQuantity] = useState(0);

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('medicines')
        .select('*')
        .gt('total_quantity', 0)
        .order('name');

      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate quantity automatically based on selected timings and days
  useEffect(() => {
    const selectedTimings = [morning, afternoon, evening, night].filter(Boolean).length;
    const calculatedQty = days * selectedTimings;
    setCalculatedQuantity(calculatedQty);
  }, [days, morning, afternoon, evening, night]);

  const handleAddMedicine = () => {
    if (!selectedMedicine) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a medicine first"
      });
      return;
    }

    if (days <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Days must be greater than 0"
      });
      return;
    }

    if (!morning && !afternoon && !evening && !night) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one dosage time"
      });
      return;
    }

    if (calculatedQuantity > selectedMedicine.total_quantity) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${selectedMedicine.total_quantity} units available`
      });
      return;
    }

    const alreadyPrescribed = prescribedMedicines.find(pm => pm.medicine.id === selectedMedicine.id);
    if (alreadyPrescribed) {
      toast({
        variant: "destructive",
        title: "Medicine Already Added",
        description: "This medicine is already in the prescription list"
      });
      return;
    }

    const prescribedMedicine: PrescribedMedicine = {
      id: `temp_${Date.now()}`,
      medicine: selectedMedicine,
      quantity: calculatedQuantity,
      days,
      morning,
      afternoon,
      evening,
      night,
      before_meal: beforeMeal,
      after_meal: afterMeal,
      fasting,
      note: note.trim() || undefined
    };

    onAddMedicine(prescribedMedicine);

    // Reset form
    setSelectedMedicine(null);
    setSearchTerm('');
    setDays(1);
    setMorning(false);
    setAfternoon(false);
    setEvening(false);
    setNight(false);
    setBeforeMeal(false);
    setAfterMeal(false);
    setFasting(false);
    setNote('');

    toast({
      title: "Medicine Added",
      description: `${selectedMedicine.name} has been added to the prescription`
    });
  };

  const filteredMedicines = medicines.filter(medicine => 
    !prescribedMedicines.find(pm => pm.medicine.id === medicine.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>Add Medicine to Prescription</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Medicine Search */}
        <div className="space-y-2">
          <Label htmlFor="medicine-search">Search Medicine</Label>
          <Input
            id="medicine-search"
            type="text"
            placeholder="Type medicine name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {searchTerm && (
            <div className="max-h-48 overflow-y-auto border rounded-md">
              {isLoading ? (
                <div className="p-2 text-center text-gray-500">Searching...</div>
              ) : filteredMedicines.length > 0 ? (
                filteredMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setSelectedMedicine(medicine);
                      setSearchTerm('');
                    }}
                  >
                    <div className="font-medium">{medicine.name}</div>
                    <div className="text-sm text-gray-500">
                      Category: {medicine.category} | Stock: {medicine.total_quantity}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">No medicines found</div>
              )}
            </div>
          )}
        </div>

        {selectedMedicine && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{selectedMedicine.name}</h3>
                <p className="text-sm text-gray-600">
                  Available Stock: {selectedMedicine.total_quantity} | Category: {selectedMedicine.category}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMedicine(null);
                  setSearchTerm('');
                }}
              >
                Change
              </Button>
            </div>

            <div>
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Dosage Times</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="morning"
                    checked={morning}
                    onCheckedChange={(checked) => setMorning(checked === true)}
                  />
                  <Label htmlFor="morning">Morning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="afternoon"
                    checked={afternoon}
                    onCheckedChange={(checked) => setAfternoon(checked === true)}
                  />
                  <Label htmlFor="afternoon">Afternoon</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="evening"
                    checked={evening}
                    onCheckedChange={(checked) => setEvening(checked === true)}
                  />
                  <Label htmlFor="evening">Evening</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="night"
                    checked={night}
                    onCheckedChange={(checked) => setNight(checked === true)}
                  />
                  <Label htmlFor="night">Night</Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Meal Timing</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="before-meal"
                    checked={beforeMeal}
                    onCheckedChange={(checked) => setBeforeMeal(checked === true)}
                  />
                  <Label htmlFor="before-meal">Before Meal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="after-meal"
                    checked={afterMeal}
                    onCheckedChange={(checked) => setAfterMeal(checked === true)}
                  />
                  <Label htmlFor="after-meal">After Meal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fasting"
                    checked={fasting}
                    onCheckedChange={(checked) => setFasting(checked === true)}
                  />
                  <Label htmlFor="fasting">Fasting</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="medicine-note">Note (Optional)</Label>
              <Textarea
                id="medicine-note"
                placeholder="Add any special instructions for this medicine..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-gray-600">
                Calculated Quantity: {calculatedQuantity} units
                <div className="text-xs text-gray-500">
                  ({days} days × {[morning, afternoon, evening, night].filter(Boolean).length} times/day)
                </div>
              </div>
              <Button onClick={handleAddMedicine} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add to Prescription</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicineSearchForm;

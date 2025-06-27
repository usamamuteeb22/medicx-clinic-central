
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Plus, Search } from 'lucide-react';

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

interface MedicineSearchFormProps {
  prescribedMedicines: PrescribedMedicine[];
  onAddMedicine: (medicine: PrescribedMedicine) => void;
}

const MedicineSearchForm: React.FC<MedicineSearchFormProps> = ({
  prescribedMedicines,
  onAddMedicine
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
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

  useEffect(() => {
    // Filter medicines based on search term
    const filtered = medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
      medicine.category.toLowerCase().includes(medicineSearchTerm.toLowerCase())
    );
    setFilteredMedicines(filtered);
  }, [medicines, medicineSearchTerm]);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .gt('total_quantity', 0)
        .order('name');

      if (error) throw error;
      setMedicines(data || []);
      setFilteredMedicines(data || []);
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

    onAddMedicine(newPrescription);

    // Reset form
    setSelectedMedicineId('');
    setQuantity('');
    setMedicineSearchTerm('');
    setDosageTiming({
      morning: false,
      afternoon: false,
      evening: false,
      night: false
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Medicine Prescription</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Medicine Search Field */}
        <div className="space-y-2">
          <Label>Search Medicines</Label>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search medicines by name or category..."
              value={medicineSearchTerm}
              onChange={(e) => setMedicineSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Medicine</Label>
            <Select value={selectedMedicineId} onValueChange={setSelectedMedicineId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose medicine" />
              </SelectTrigger>
              <SelectContent>
                {filteredMedicines.map((medicine) => (
                  <SelectItem key={medicine.id} value={medicine.id}>
                    {medicine.name} - Stock: {medicine.total_quantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredMedicines.length === 0 && medicineSearchTerm && (
              <p className="text-sm text-gray-500">No medicines found matching your search.</p>
            )}
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
  );
};

export default MedicineSearchForm;

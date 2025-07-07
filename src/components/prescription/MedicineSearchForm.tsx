
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
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

  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setMedicineSearchTerm(medicine.name);
  };

  const handleAddMedicine = () => {
    if (!selectedMedicine || !quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a medicine and enter quantity"
      });
      return;
    }

    if (parseInt(quantity) > selectedMedicine.total_quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Insufficient stock. Available: ${selectedMedicine.total_quantity}`
      });
      return;
    }

    // Check if medicine already prescribed
    if (prescribedMedicines.some(pm => pm.medicine.id === selectedMedicine.id)) {
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
    setSelectedMedicine(null);
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
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-emerald-700">
          <Plus className="h-4 w-4" />
          <span>Add Medicine Prescription</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Medicine Search Field */}
        <div className="space-y-2">
          <Label className="text-emerald-700">Search Medicines</Label>
          <div className="relative">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search medicines by name or category..."
                value={medicineSearchTerm}
                onChange={(e) => {
                  setMedicineSearchTerm(e.target.value);
                  setSelectedMedicine(null);
                }}
                className="flex-1 border-green-200 focus:border-green-400"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {medicineSearchTerm && !selectedMedicine && filteredMedicines.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-green-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredMedicines.slice(0, 10).map((medicine) => (
                  <div
                    key={medicine.id}
                    onClick={() => handleMedicineSelect(medicine)}
                    className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{medicine.name}</div>
                    <div className="text-sm text-gray-500">
                      Category: {medicine.category} | Stock: {medicine.total_quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {medicineSearchTerm && filteredMedicines.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-green-200 rounded-md shadow-lg p-3">
                <p className="text-sm text-gray-500">No medicines found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-emerald-700">Selected Medicine</Label>
            <div className="p-3 bg-white border border-green-200 rounded-md">
              {selectedMedicine ? (
                <div>
                  <div className="font-medium">{selectedMedicine.name}</div>
                  <div className="text-sm text-gray-500">
                    Category: {selectedMedicine.category} | Available: {selectedMedicine.total_quantity}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Search and select a medicine above</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-emerald-700">Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="1"
              className="border-green-200 focus:border-green-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-emerald-700">Dosage Timing</Label>
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

        <Button 
          onClick={handleAddMedicine} 
          className="w-full bg-emerald-600 hover:bg-emerald-700"
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

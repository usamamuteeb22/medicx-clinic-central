
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
  days: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  before_meal: boolean;
  after_meal: boolean;
  fasting: boolean;
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
  const [days, setDays] = useState('1');
  const [dosageTiming, setDosageTiming] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
    before_meal: false,
    after_meal: false,
    fasting: false
  });

  // Calculate quantity based on days and selected dosage timings
  const calculateQuantity = () => {
    const timingCount = Object.values(dosageTiming).filter(Boolean).length;
    return parseInt(days) * timingCount;
  };

  const quantity = calculateQuantity();

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
    if (!selectedMedicine || !days || quantity === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a medicine, enter days, and select at least one dosage timing"
      });
      return;
    }

    if (quantity > selectedMedicine.total_quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Insufficient stock. Available: ${selectedMedicine.total_quantity}, Required: ${quantity}`
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
      quantity: quantity,
      days: parseInt(days),
      morning: dosageTiming.morning,
      afternoon: dosageTiming.afternoon,
      evening: dosageTiming.evening,
      night: dosageTiming.night,
      before_meal: dosageTiming.before_meal,
      after_meal: dosageTiming.after_meal,
      fasting: dosageTiming.fasting
    };

    onAddMedicine(newPrescription);

    // Reset form
    setSelectedMedicine(null);
    setDays('1');
    setMedicineSearchTerm('');
    setDosageTiming({
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      before_meal: false,
      after_meal: false,
      fasting: false
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Label className="text-emerald-700">Days</Label>
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Enter days"
              min="1"
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-emerald-700">Auto-calculated Quantity</Label>
            <div className="p-3 bg-white border border-green-200 rounded-md">
              <div className="font-medium text-blue-600">{quantity}</div>
              <div className="text-xs text-gray-500">
                {days} days × {Object.values(dosageTiming).filter(Boolean).length} timings
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-emerald-700">Dosage Timing</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="before_meal"
                checked={dosageTiming.before_meal}
                onCheckedChange={(checked) => 
                  setDosageTiming({...dosageTiming, before_meal: !!checked})
                }
              />
              <Label htmlFor="before_meal">Before Meal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="after_meal"
                checked={dosageTiming.after_meal}
                onCheckedChange={(checked) => 
                  setDosageTiming({...dosageTiming, after_meal: !!checked})
                }
              />
              <Label htmlFor="after_meal">After Meal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fasting"
                checked={dosageTiming.fasting}
                onCheckedChange={(checked) => 
                  setDosageTiming({...dosageTiming, fasting: !!checked})
                }
              />
              <Label htmlFor="fasting">Fasting</Label>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleAddMedicine} 
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={!selectedMedicine || !days || quantity === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine (Qty: {quantity})
        </Button>
      </CardContent>
    </Card>
  );
};

export default MedicineSearchForm;

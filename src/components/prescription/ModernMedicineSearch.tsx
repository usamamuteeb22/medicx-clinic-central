
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, Package } from 'lucide-react';

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

interface ModernMedicineSearchProps {
  reportId?: string;
  prescribedMedicines: DoctorPrescribedMedicine[];
  onAddMedicine: (medicine: DoctorPrescribedMedicine) => void;
}

const ModernMedicineSearch: React.FC<ModernMedicineSearchProps> = ({
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
  const [showResults, setShowResults] = useState(false);

  // Fetch medicines based on search query
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      const { data, error } = await supabase
        .from('medicines')
        .select('id, name, category, total_quantity')
        .gt('total_quantity', 0)
        .ilike('name', `%${searchQuery}%`)
        .order('name')
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!searchQuery
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedMedicine(null);
    setShowResults(value.length > 0);
  };

  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setSearchQuery(medicine.name);
    setShowResults(false);
  };

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
    setShowResults(false);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-700">
          <Package className="h-5 w-5" />
          <span>Add Medicine Prescription</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Medicine Search */}
        <div className="space-y-2">
          <Label htmlFor="medicineSearch" className="text-blue-700 font-medium">
            Search Medicine
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="medicineSearch"
              placeholder="Type medicine name to search..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400"
            />
            
            {/* Search Results Dropdown */}
            {showResults && medicines && medicines.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-blue-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {medicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    onClick={() => handleMedicineSelect(medicine)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">{medicine.category}</div>
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        Stock: {medicine.total_quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showResults && searchQuery && medicines && medicines.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-blue-200 rounded-md shadow-lg p-3">
                <p className="text-sm text-gray-500">No medicines found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Medicine Display */}
        {selectedMedicine && (
          <div className="p-4 bg-white border border-blue-200 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-lg text-gray-900">{selectedMedicine.name}</div>
                <div className="text-sm text-gray-500 mb-2">{selectedMedicine.category}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Available Stock</div>
                <div className="text-lg font-bold text-blue-600">{selectedMedicine.total_quantity}</div>
              </div>
            </div>
          </div>
        )}

        {/* Quantity Input */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-blue-700 font-medium">
            Quantity to Prescribe
          </Label>
          <Input
            id="quantity"
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            max={selectedMedicine?.total_quantity}
            className="border-blue-200 focus:border-blue-400"
          />
        </div>

        {/* Timing Selection */}
        <div className="space-y-3">
          <Label className="text-blue-700 font-medium">When to take medication</Label>
          <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-md border border-blue-200">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="morning"
                checked={morning}
                onCheckedChange={(checked) => setMorning(checked === true)}
              />
              <Label htmlFor="morning" className="font-medium">🌅 Morning</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="afternoon"
                checked={afternoon}
                onCheckedChange={(checked) => setAfternoon(checked === true)}
              />
              <Label htmlFor="afternoon" className="font-medium">☀️ Afternoon</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="evening"
                checked={evening}
                onCheckedChange={(checked) => setEvening(checked === true)}
              />
              <Label htmlFor="evening" className="font-medium">🌆 Evening</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="night"
                checked={night}
                onCheckedChange={(checked) => setNight(checked === true)}
              />
              <Label htmlFor="night" className="font-medium">🌙 Night</Label>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <Button 
          onClick={handleAddMedicine}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!selectedMedicine || !quantity}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine to Prescription
        </Button>
      </CardContent>
    </Card>
  );
};

export default ModernMedicineSearch;

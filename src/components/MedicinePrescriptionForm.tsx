
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Search, AlertTriangle } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prescribedMedicines.some(pm => pm.medicine.id === medicine.id)
      );
      setFilteredMedicines(filtered);
      setShowDropdown(true);
    } else {
      setFilteredMedicines([]);
      setShowDropdown(false);
    }
  }, [searchQuery, medicines, prescribedMedicines]);

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
    }
  };

  const addMedicine = (medicine: Medicine) => {
    const newPrescription: PrescribedMedicine = {
      id: Math.random().toString(36).substr(2, 9),
      medicine,
      quantity: 1,
      morning: false,
      evening: false,
      night: false
    };
    
    onPrescribedMedicinesChange([...prescribedMedicines, newPrescription]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removeMedicine = (id: string) => {
    onPrescribedMedicinesChange(prescribedMedicines.filter(pm => pm.id !== id));
  };

  const updatePrescription = (id: string, updates: Partial<PrescribedMedicine>) => {
    onPrescribedMedicinesChange(
      prescribedMedicines.map(pm => 
        pm.id === id ? { ...pm, ...updates } : pm
      )
    );
  };

  const validateQuantity = (prescription: PrescribedMedicine, newQuantity: number) => {
    if (newQuantity > prescription.medicine.total_quantity) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${prescription.medicine.total_quantity} units available for ${prescription.medicine.name}`
      });
      return false;
    }
    return true;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tablet': return 'bg-blue-100 text-blue-800';
      case 'syrup': return 'bg-green-100 text-green-800';
      case 'injection': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Medicine Search */}
      <div className="relative">
        <Label htmlFor="medicine-search">Add Medicine</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="medicine-search"
            placeholder="Search medicine to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Medicine Dropdown */}
        {showDropdown && filteredMedicines.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredMedicines.map((medicine) => (
              <div
                key={medicine.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => addMedicine(medicine)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{medicine.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(medicine.category)}`}>
                        {medicine.category.charAt(0).toUpperCase() + medicine.category.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {medicine.total_quantity}
                      </span>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescribed Medicines List */}
      <div className="space-y-3">
        {prescribedMedicines.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No medicines prescribed yet</p>
                <p className="text-sm">Search and add medicines above</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          prescribedMedicines.map((prescription) => (
            <Card key={prescription.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium">{prescription.medicine.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(prescription.medicine.category)}`}>
                        {prescription.medicine.category.charAt(0).toUpperCase() + prescription.medicine.category.slice(1)}
                      </span>
                      {prescription.quantity > prescription.medicine.total_quantity && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs">Insufficient stock</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Available stock: {prescription.medicine.total_quantity} units
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedicine(prescription.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quantity Input */}
                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${prescription.id}`}>Quantity</Label>
                    <Input
                      id={`quantity-${prescription.id}`}
                      type="number"
                      min="1"
                      max={prescription.medicine.total_quantity}
                      value={prescription.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1;
                        if (validateQuantity(prescription, newQuantity)) {
                          updatePrescription(prescription.id, { quantity: newQuantity });
                        }
                      }}
                      className={prescription.quantity > prescription.medicine.total_quantity ? 'border-red-500' : ''}
                    />
                  </div>

                  {/* Dosage Timing */}
                  <div className="space-y-2">
                    <Label>Dosage Timing</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`morning-${prescription.id}`}
                          checked={prescription.morning}
                          onCheckedChange={(checked) => 
                            updatePrescription(prescription.id, { morning: checked as boolean })
                          }
                        />
                        <Label htmlFor={`morning-${prescription.id}`} className="text-sm">Morning</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`evening-${prescription.id}`}
                          checked={prescription.evening}
                          onCheckedChange={(checked) => 
                            updatePrescription(prescription.id, { evening: checked as boolean })
                          }
                        />
                        <Label htmlFor={`evening-${prescription.id}`} className="text-sm">Evening</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`night-${prescription.id}`}
                          checked={prescription.night}
                          onCheckedChange={(checked) => 
                            updatePrescription(prescription.id, { night: checked as boolean })
                          }
                        />
                        <Label htmlFor={`night-${prescription.id}`} className="text-sm">Night</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicinePrescriptionForm;

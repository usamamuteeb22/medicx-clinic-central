
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Package, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Medicine {
  id: string;
  name: string;
  total_quantity: number;
}

interface StockManagementSectionProps {
  medicines: Medicine[];
}

const StockManagementSection = ({ medicines }: StockManagementSectionProps) => {
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [stockType, setStockType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Filter medicines based on search term
    const filtered = medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(medicineSearchTerm.toLowerCase())
    );
    setFilteredMedicines(filtered);
  }, [medicines, medicineSearchTerm]);

  const stockMutation = useMutation({
    mutationFn: async ({ medicineId, stockType, quantity, expiryDate }: {
      medicineId: string;
      stockType: string;
      quantity: number;
      expiryDate?: string;
    }) => {
      const { error } = await supabase
        .from('medicine_stock_history')
        .insert({
          medicine_id: medicineId,
          stock_type: stockType,
          quantity: quantity,
          expiry_date: expiryDate || null,
          created_by: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Stock Updated",
        description: "Medicine stock has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      // Reset form
      setSelectedMedicine(null);
      setMedicineSearchTerm('');
      setStockType('');
      setQuantity('');
      setExpiryDate('');
    },
    onError: (error) => {
      console.error('Error updating stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stock. Please try again."
      });
    }
  });

  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setMedicineSearchTerm(medicine.name);
  };

  const handleStockUpdate = () => {
    if (!selectedMedicine || !stockType || !quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all required fields"
      });
      return;
    }

    stockMutation.mutate({
      medicineId: selectedMedicine.id,
      stockType: stockType,
      quantity: parseInt(quantity),
      expiryDate: expiryDate || undefined
    });
  };

  // Only show for Admin and Pharmacy roles
  if (user?.role !== 'admin' && user?.role !== 'pharmacy') {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-purple-700">
          <Package className="h-5 w-5" />
          <span>Stock Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-purple-700">Search Medicine</Label>
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medicine by name..."
                  value={medicineSearchTerm}
                  onChange={(e) => {
                    setMedicineSearchTerm(e.target.value);
                    setSelectedMedicine(null);
                  }}
                  className="flex-1 border-purple-200 focus:border-purple-400"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {medicineSearchTerm && !selectedMedicine && filteredMedicines.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredMedicines.slice(0, 10).map((medicine) => (
                    <div
                      key={medicine.id}
                      onClick={() => handleMedicineSelect(medicine)}
                      className="p-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">
                        Current Stock: {medicine.total_quantity}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {medicineSearchTerm && filteredMedicines.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-md shadow-lg p-3">
                  <p className="text-sm text-gray-500">No medicines found matching your search.</p>
                </div>
              )}
            </div>
            
            {selectedMedicine && (
              <div className="p-3 bg-white border border-purple-200 rounded-md">
                <div className="font-medium">{selectedMedicine.name}</div>
                <div className="text-sm text-gray-500">
                  Current Stock: {selectedMedicine.total_quantity}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-purple-700">Stock Action</Label>
            <Select value={stockType} onValueChange={setStockType}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Choose action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Stock</SelectItem>
                <SelectItem value="remove">Remove Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-purple-700">Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="1"
              className="border-purple-200 focus:border-purple-400"
            />
          </div>
          {stockType === 'add' && (
            <div className="space-y-2">
              <Label className="text-purple-700">Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
          )}
        </div>
        <Button 
          onClick={handleStockUpdate} 
          disabled={stockMutation.isPending || !selectedMedicine}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {stockMutation.isPending ? 'Updating...' : 'Update Stock'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StockManagementSection;

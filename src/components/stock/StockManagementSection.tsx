
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Package } from 'lucide-react';
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
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [stockType, setStockType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      setSelectedMedicineId('');
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

  const handleStockUpdate = () => {
    if (!selectedMedicineId || !stockType || !quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all required fields"
      });
      return;
    }

    stockMutation.mutate({
      medicineId: selectedMedicineId,
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Stock Management</span>
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
                    {medicine.name} - Current Stock: {medicine.total_quantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Stock Action</Label>
            <Select value={stockType} onValueChange={setStockType}>
              <SelectTrigger>
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
            <Label>Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="1"
            />
          </div>
          {stockType === 'add' && (
            <div className="space-y-2">
              <Label>Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          )}
        </div>
        <Button onClick={handleStockUpdate} disabled={stockMutation.isPending}>
          {stockMutation.isPending ? 'Updating...' : 'Update Stock'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StockManagementSection;

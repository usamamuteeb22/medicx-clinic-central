
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MedicineCategory = "tablet" | "syrup" | "injection" | "sachet" | "drops" | "lotion" | "cream" | "ointment" | "suspension" | "gel" | "infusion" | "transfusion";

const AddMedicineModal = ({ isOpen, onClose }: AddMedicineModalProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MedicineCategory | ''>('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addMedicineMutation = useMutation({
    mutationFn: async (medicineData: {
      name: string;
      category: MedicineCategory;
      quantity: number;
      expiry_date?: string;
    }) => {
      // First create the medicine with zero quantity - the trigger will update it
      const { data, error } = await supabase
        .from('medicines')
        .insert({
          name: medicineData.name,
          category: medicineData.category,
          total_quantity: 0, // Start with 0, let the stock history trigger update it
          expiry_date: medicineData.expiry_date || null
        })
        .select()
        .single();

      if (error) throw error;

      // Add initial stock entry if quantity > 0 - this will trigger the stock update
      if (medicineData.quantity > 0) {
        const { error: stockError } = await supabase
          .from('medicine_stock_history')
          .insert({
            medicine_id: data.id,
            stock_type: 'add',
            quantity: medicineData.quantity,
            expiry_date: medicineData.expiry_date || null,
            created_by: user?.id,
            user_type: user?.role
          });

        if (stockError) throw stockError;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Medicine Added",
        description: "New medicine has been added successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      handleClose();
    },
    onError: (error) => {
      console.error('Error adding medicine:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add medicine. Please try again."
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    addMedicineMutation.mutate({
      name,
      category: category as MedicineCategory,
      quantity: parseInt(quantity) || 0,
      expiry_date: expiryDate || undefined
    });
  };

  const handleClose = () => {
    setName('');
    setCategory('');
    setQuantity('');
    setExpiryDate('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medicine Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter medicine name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as MedicineCategory)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="syrup">Syrup</SelectItem>
                <SelectItem value="injection">Injection</SelectItem>
                <SelectItem value="sachet">Sachet</SelectItem>
                <SelectItem value="drops">Drops</SelectItem>
                <SelectItem value="lotion">Lotion</SelectItem>
                <SelectItem value="cream">Cream</SelectItem>
                <SelectItem value="ointment">Ointment</SelectItem>
                <SelectItem value="suspension">Suspension</SelectItem>
                <SelectItem value="gel">Gel</SelectItem>
                <SelectItem value="infusion">Infusion</SelectItem>
                <SelectItem value="transfusion">Transfusion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Initial Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter initial quantity"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={addMedicineMutation.isPending} className="flex-1">
              {addMedicineMutation.isPending ? 'Adding...' : 'Add Medicine'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicineModal;

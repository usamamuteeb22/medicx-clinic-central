
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MedicineCategory = "tablet" | "syrup" | "injection" | "gel" | "ointment" | "cream" | "suspension" | "drops" | "sachet" | "infusion" | "transfusion" | "lotion";

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    category: '' as MedicineCategory | '',
    quantity: '',
    expiry_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category) return;

    setLoading(true);
    try {
      // First, create the medicine
      const { data: medicine, error: medicineError } = await supabase
        .from('medicines')
        .insert({
          name: formData.name,
          category: formData.category as MedicineCategory,
          total_quantity: 0,
          expiry_date: formData.expiry_date || null
        })
        .select()
        .single();

      if (medicineError) throw medicineError;

      // Then add stock entry to update the quantity
      if (parseInt(formData.quantity) > 0) {
        const { error: stockError } = await supabase
          .from('medicine_stock_history')
          .insert([
            {
              medicine_id: medicine.id,
              stock_type: 'add',
              quantity: parseInt(formData.quantity),
              expiry_date: formData.expiry_date || null,
              created_by: user.id,
              user_type: user.role
            }
          ]);

        if (stockError) throw stockError;
      }

      toast({
        title: "Success",
        description: "Medicine added successfully"
      });

      // Reset form and close modal
      setFormData({
        name: '',
        category: '',
        quantity: '',
        expiry_date: ''
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      
      onClose();
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add medicine"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      expiry_date: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medicine Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value: MedicineCategory) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="syrup">Syrup</SelectItem>
                <SelectItem value="injection">Injection</SelectItem>
                <SelectItem value="gel">Gel</SelectItem>
                <SelectItem value="ointment">Ointment</SelectItem>
                <SelectItem value="cream">Cream</SelectItem>
                <SelectItem value="suspension">Suspension</SelectItem>
                <SelectItem value="drops">Drops</SelectItem>
                <SelectItem value="sachet">Sachet</SelectItem>
                <SelectItem value="infusion">Infusion</SelectItem>
                <SelectItem value="transfusion">Transfusion</SelectItem>
                <SelectItem value="lotion">Lotion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Initial Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Medicine'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicineModal;

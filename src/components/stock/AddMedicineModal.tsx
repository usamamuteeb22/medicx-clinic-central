
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type MedicineCategory = Database['public']['Enums']['medicine_category'];

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMedicineAdded: () => void;
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onMedicineAdded
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category: '' as MedicineCategory,
    total_quantity: '',
    expiry_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add medicines"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('medicines')
        .insert({
          name: formData.name,
          category: formData.category as MedicineCategory,
          total_quantity: parseInt(formData.total_quantity),
          expiry_date: formData.expiry_date || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medicine added successfully!"
      });

      setFormData({
        name: '',
        category: '' as MedicineCategory,
        total_quantity: '',
        expiry_date: ''
      });

      onMedicineAdded();
      onClose();
    } catch (error: any) {
      console.error('Error adding medicine:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add medicine"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '' as MedicineCategory,
      total_quantity: '',
      expiry_date: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medicine Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value: MedicineCategory) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="syrup">Syrup</SelectItem>
                <SelectItem value="injection">Injection</SelectItem>
                <SelectItem value="Capsule">Capsule</SelectItem>
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
            <Label htmlFor="quantity">Initial Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.total_quantity}
              onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
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

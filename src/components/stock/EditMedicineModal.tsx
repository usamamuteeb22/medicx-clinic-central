
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Medicine {
  id: string;
  name: string;
  category: string;
  serial_number: number;
  total_quantity: number;
  expiry_date: string;
  last_updated: string;
}

interface EditMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onMedicineUpdated: () => void;
}

const categories = ['tablet', 'syrup', 'injection', 'sachet', 'drops', 'lotion', 'cream', 'ointment', 'suspension', 'gel', 'infusion', 'transfusion', 'Capsule'] as const;

const EditMedicineModal: React.FC<EditMedicineModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onMedicineUpdated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '' as typeof categories[number]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        category: medicine.category as typeof categories[number]
      });
    }
  }, [medicine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('medicines')
        .update({
          name: formData.name.trim(),
          category: formData.category
        })
        .eq('id', medicine.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medicine updated successfully!"
      });

      onMedicineUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating medicine:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update medicine"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: 'tablet'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Medicine Details</DialogTitle>
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
              onValueChange={(value) => setFormData({ ...formData, category: value as typeof categories[number] })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Medicine'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedicineModal;

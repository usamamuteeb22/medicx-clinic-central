
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Medicine {
  id: string;
  name: string;
  category: string;
  serial_number: number;
  total_quantity: number;
  expiry_date: string;
  last_updated: string;
}

interface StockHistory {
  id: string;
  stock_type: string;
  quantity: number;
  expiry_date: string;
  created_at: string;
  user_type: string;
  created_by: string;
  patient_name?: string;
}

const MedicineDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [addQuantity, setAddQuantity] = useState('');
  const [removeQuantity, setRemoveQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { data: medicine, isLoading: medicineLoading } = useQuery({
    queryKey: ['medicine', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Medicine;
    },
    enabled: !!id
  });

  const { data: stockHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['stock-history', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine_stock_history')
        .select('*')
        .eq('medicine_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enhance the data with patient names for medicine usage
      const enhancedHistory = await Promise.all(
        data.map(async (record) => {
          if (record.stock_type === 'remove' && record.user_type === null) {
            // This might be from patient usage, try to find the patient name
            const { data: usageData } = await supabase
              .from('medicine_usage')
              .select('patient_id')
              .eq('medicine_id', id)
              .eq('quantity_used', record.quantity)
              .limit(1);

            if (usageData && usageData.length > 0) {
              // Fetch patient name separately
              const { data: patientData } = await supabase
                .from('patients')
                .select('name')
                .eq('id', usageData[0].patient_id)
                .single();

              return {
                ...record,
                patient_name: patientData?.name || 'Unknown Patient',
                user_type: 'patient_usage'
              };
            }
          }
          return record;
        })
      );

      return enhancedHistory;
    },
    enabled: !!id
  });

  const addStockMutation = useMutation({
    mutationFn: async ({ quantity, expiry }: { quantity: number; expiry?: string }) => {
      const { error } = await supabase
        .from('medicine_stock_history')
        .insert({
          medicine_id: id,
          stock_type: 'add',
          quantity,
          expiry_date: expiry || null,
          created_by: user?.id,
          user_type: user?.role
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Stock Added",
        description: "Medicine stock has been successfully added."
      });
      setAddQuantity('');
      setExpiryDate('');
      queryClient.invalidateQueries({ queryKey: ['medicine', id] });
      queryClient.invalidateQueries({ queryKey: ['stock-history', id] });
    },
    onError: (error) => {
      console.error('Error adding stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add stock. Please try again."
      });
    }
  });

  const removeStockMutation = useMutation({
    mutationFn: async (quantity: number) => {
      const { error } = await supabase
        .from('medicine_stock_history')
        .insert({
          medicine_id: id,
          stock_type: 'remove',
          quantity,
          created_by: user?.id,
          user_type: user?.role
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Stock Removed",
        description: "Medicine stock has been successfully removed."
      });
      setRemoveQuantity('');
      queryClient.invalidateQueries({ queryKey: ['medicine', id] });
      queryClient.invalidateQueries({ queryKey: ['stock-history', id] });
    },
    onError: (error) => {
      console.error('Error removing stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove stock. Please try again."
      });
    }
  });

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addQuantity || parseInt(addQuantity) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: "Please enter a valid quantity to add."
      });
      return;
    }

    addStockMutation.mutate({
      quantity: parseInt(addQuantity),
      expiry: expiryDate
    });
  };

  const handleRemoveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeQuantity || parseInt(removeQuantity) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: "Please enter a valid quantity to remove."
      });
      return;
    }

    if (medicine && parseInt(removeQuantity) > medicine.total_quantity) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: "Cannot remove more stock than available."
      });
      return;
    }

    removeStockMutation.mutate(parseInt(removeQuantity));
  };

  const getUserDisplayName = (record: StockHistory) => {
    if (record.user_type === 'pharmacy') {
      return 'Pharmacy';
    } else if (record.user_type === 'admin') {
      return 'Admin';
    } else if (record.user_type === 'patient_usage' && record.patient_name) {
      return record.patient_name;
    } else if (record.user_type === null && record.patient_name) {
      return record.patient_name;
    }
    return 'System';
  };

  if (medicineLoading || historyLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading medicine details...</div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Medicine not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/medicines')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Medicines
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{medicine.name}</h1>
      </div>

      {/* Medicine Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Medicine Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Serial Number</Label>
                <p className="text-lg">{medicine.serial_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Category</Label>
                <p className="text-lg">
                  <Badge variant="secondary">{medicine.category}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Current Stock</Label>
                <p className="text-lg">
                  <Badge variant={medicine.total_quantity < 10 ? "destructive" : "default"}>
                    {medicine.total_quantity} units
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Expiry Date</Label>
                <p className="text-lg">
                  {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Management - now available for both pharmacy and admin */}
        {(user?.role === 'pharmacy' || user?.role === 'admin') && (
          <Card>
            <CardHeader>
              <CardTitle>Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddStock} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addQuantity">Add Stock</Label>
                  <Input
                    id="addQuantity"
                    type="number"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                    placeholder="Enter quantity to add"
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
                <Button type="submit" className="w-full" disabled={addStockMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
              </form>

              <hr />

              <form onSubmit={handleRemoveStock} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="removeQuantity">Remove Stock</Label>
                  <Input
                    id="removeQuantity"
                    type="number"
                    value={removeQuantity}
                    onChange={(e) => setRemoveQuantity(e.target.value)}
                    placeholder="Enter quantity to remove"
                  />
                </div>
                <Button type="submit" variant="destructive" className="w-full" disabled={removeStockMutation.isPending}>
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Stock
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stock History */}
      <Card>
        <CardHeader>
          <CardTitle>Stock History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Date</th>
                  <th className="text-left p-2 font-medium">Action</th>
                  <th className="text-left p-2 font-medium">Quantity</th>
                  <th className="text-left p-2 font-medium">User</th>
                  <th className="text-left p-2 font-medium">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {stockHistory.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <Badge variant={record.stock_type === 'add' ? 'default' : 'destructive'}>
                        {record.stock_type === 'add' ? 'Added' : 'Removed'}
                      </Badge>
                    </td>
                    <td className="p-2">{record.quantity}</td>
                    <td className="p-2">{getUserDisplayName(record)}</td>
                    <td className="p-2">
                      {record.expiry_date ? new Date(record.expiry_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineDetailPage;

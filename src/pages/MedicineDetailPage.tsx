
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Minus, History } from 'lucide-react';

interface Medicine {
  id: string;
  serial_number: number;
  name: string;
  category: 'tablet' | 'syrup' | 'injection';
  total_quantity: number;
  expiry_date: string;
}

interface StockHistory {
  id: string;
  stock_type: string;
  quantity: number;
  expiry_date: string;
  created_at: string;
}

const MedicineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isRemoveStockOpen, setIsRemoveStockOpen] = useState(false);
  const [addStockData, setAddStockData] = useState({
    quantity: '',
    expiry_date: ''
  });
  const [removeStockData, setRemoveStockData] = useState({
    quantity: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMedicineDetails();
      fetchStockHistory();
    }
  }, [id]);

  const fetchMedicineDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMedicine(data);
    } catch (error) {
      console.error('Error fetching medicine details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch medicine details"
      });
    }
  };

  const fetchStockHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('medicine_stock_history')
        .select('*')
        .eq('medicine_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStockHistory(data || []);
    } catch (error) {
      console.error('Error fetching stock history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch stock history"
      });
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !medicine) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('medicine_stock_history')
        .insert([
          {
            medicine_id: medicine.id,
            stock_type: 'add',
            quantity: parseInt(addStockData.quantity),
            expiry_date: addStockData.expiry_date,
            created_by: user.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock added successfully"
      });

      setAddStockData({ quantity: '', expiry_date: '' });
      setIsAddStockOpen(false);
      fetchMedicineDetails();
      fetchStockHistory();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add stock"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !medicine) return;

    const quantityToRemove = parseInt(removeStockData.quantity);
    if (quantityToRemove > medicine.total_quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot remove more stock than available"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('medicine_stock_history')
        .insert([
          {
            medicine_id: medicine.id,
            stock_type: 'remove',
            quantity: quantityToRemove,
            created_by: user.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock removed successfully"
      });

      setRemoveStockData({ quantity: '' });
      setIsRemoveStockOpen(false);
      fetchMedicineDetails();
      fetchStockHistory();
    } catch (error) {
      console.error('Error removing stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove stock"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (!medicine) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/medicines')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Medicine Stock
        </Button>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading medicine details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/medicines')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Medicine Stock
      </Button>

      {/* Medicine Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {medicine.name} - {getCategoryDisplayName(medicine.category)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Serial Number</Label>
              <p className="text-lg font-semibold">{medicine.serial_number}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Current Stock</Label>
              <p className={`text-lg font-semibold ${
                medicine.total_quantity < 10 ? 'text-red-600' : 
                medicine.total_quantity < 50 ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {medicine.total_quantity} units
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Category</Label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                medicine.category === 'tablet' ? 'bg-blue-100 text-blue-800' :
                medicine.category === 'syrup' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {getCategoryDisplayName(medicine.category)}
              </span>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Expiry Date</Label>
              <p className="text-lg font-semibold">
                {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Plus className="h-5 w-5" />
              <span>Add Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Add New Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddStock} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date and Time</Label>
                    <p className="text-sm text-gray-600">{new Date().toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-quantity">Quantity</Label>
                    <Input
                      id="add-quantity"
                      type="number"
                      value={addStockData.quantity}
                      onChange={(e) => setAddStockData({...addStockData, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-expiry">Expiry Date</Label>
                    <Input
                      id="add-expiry"
                      type="date"
                      value={addStockData.expiry_date}
                      onChange={(e) => setAddStockData({...addStockData, expiry_date: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Adding...' : 'Add Stock'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Remove Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <Minus className="h-5 w-5" />
              <span>Remove Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isRemoveStockOpen} onOpenChange={setIsRemoveStockOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Remove Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Stock</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRemoveStock} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date and Time</Label>
                    <p className="text-sm text-gray-600">{new Date().toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="remove-quantity">Quantity</Label>
                    <Input
                      id="remove-quantity"
                      type="number"
                      max={medicine.total_quantity}
                      value={removeStockData.quantity}
                      onChange={(e) => setRemoveStockData({quantity: e.target.value})}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Available stock: {medicine.total_quantity} units
                    </p>
                  </div>
                  <Button type="submit" disabled={loading} variant="destructive" className="w-full">
                    {loading ? 'Removing...' : 'Remove Stock'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Stock History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Stock History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No stock history found
                    </TableCell>
                  </TableRow>
                ) : (
                  stockHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.stock_type === 'add' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.stock_type === 'add' ? 'Add Stock' : 'Remove Stock'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.stock_type === 'add' ? '+' : '-'}{record.quantity}
                      </TableCell>
                      <TableCell>
                        {new Date(record.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {record.expiry_date ? new Date(record.expiry_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineDetailPage;

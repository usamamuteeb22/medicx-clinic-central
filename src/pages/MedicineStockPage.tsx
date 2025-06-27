
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Medicine {
  id: string;
  name: string;
  category: string;
  serial_number: number;
  total_quantity: number;
  expiry_date: string;
  last_updated: string;
}

const MedicineStockPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [stockType, setStockType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Medicine[];
    }
  });

  const deleteMedicineMutation = useMutation({
    mutationFn: async (medicineId: string) => {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', medicineId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Medicine Deleted",
        description: "Medicine has been successfully deleted."
      });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
    onError: (error) => {
      console.error('Error deleting medicine:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete medicine. Please try again."
      });
    }
  });

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

  const handleDeleteMedicine = (medicineId: string) => {
    deleteMedicineMutation.mutate(medicineId);
  };

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

  const downloadPDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medicine Stock Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Medicine Stock Inventory Report</h1>
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Quantity in Stock</th>
                <th>Expiry Date</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMedicines.map((medicine) => `
                <tr>
                  <td>${medicine.serial_number}</td>
                  <td>${medicine.name}</td>
                  <td>${medicine.category}</td>
                  <td>${medicine.total_quantity}</td>
                  <td>${medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}</td>
                  <td>${new Date(medicine.last_updated).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <p>Total Medicines: ${filteredMedicines.length}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicine-stock-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.serial_number.toString().includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading medicines...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Medicine Stock</h1>
        <div className="flex space-x-2">
          <Button onClick={downloadPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => navigate('/medicines/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Stock Management Section - Visible for Admin and Pharmacy */}
      {(user?.role === 'admin' || user?.role === 'pharmacy') && (
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
      )}

      <Card>
        <CardHeader>
          <CardTitle>Search Medicines</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, category, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Serial No.</th>
                  <th className="text-left p-2 font-medium">Medicine Name</th>
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-left p-2 font-medium">Quantity in Stock</th>
                  <th className="text-left p-2 font-medium">Expiry Date</th>
                  <th className="text-left p-2 font-medium">Last Updated</th>
                  <th className="text-left p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Badge variant="outline">{medicine.serial_number}</Badge>
                    </td>
                    <td className="p-2 font-medium">
                      <button
                        onClick={() => navigate(`/medicines/${medicine.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        {medicine.name}
                      </button>
                    </td>
                    <td className="p-2">
                      <Badge variant="secondary">{medicine.category}</Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={medicine.total_quantity < 10 ? "destructive" : "default"}>
                        {medicine.total_quantity}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-2">
                      {new Date(medicine.last_updated).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {user?.role === 'admin' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {medicine.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMedicine(medicine.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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

export default MedicineStockPage;

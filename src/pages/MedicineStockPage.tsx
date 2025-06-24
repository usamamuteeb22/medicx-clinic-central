
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Pill, Plus, Search, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Medicine {
  id: string;
  serial_number: number;
  name: string;
  category: 'tablet' | 'syrup' | 'injection';
  total_quantity: number;
  expiry_date: string;
  last_updated: string;
}

const MedicineStockPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    expiry_date: ''
  });
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    category: '',
    expiry_date: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('serial_number', { ascending: true });

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch medicines"
      });
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Insert medicine
      const { data: medicineData, error: medicineError } = await supabase
        .from('medicines')
        .insert({
          name: formData.name,
          category: formData.category as 'tablet' | 'syrup' | 'injection',
          total_quantity: 0, // Will be updated by trigger
          expiry_date: formData.expiry_date
        })
        .select()
        .single();

      if (medicineError) throw medicineError;

      // Add initial stock
      const { error: stockError } = await supabase
        .from('medicine_stock_history')
        .insert({
          medicine_id: medicineData.id,
          stock_type: 'add',
          quantity: parseInt(formData.quantity),
          expiry_date: formData.expiry_date,
          created_by: user.id
        });

      if (stockError) throw stockError;

      toast({
        title: "Success",
        description: "Medicine added successfully"
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        category: '',
        quantity: '',
        expiry_date: ''
      });
      setIsAddDialogOpen(false);

      // Refresh medicines list
      fetchMedicines();
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

  const handleRowClick = (medicine: Medicine) => {
    navigate(`/medicines/${medicine.id}`);
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesName = searchFilters.name === '' || 
      medicine.name.toLowerCase().includes(searchFilters.name.toLowerCase());
    const matchesCategory = searchFilters.category === '' || 
      medicine.category === searchFilters.category;
    const matchesExpiryDate = searchFilters.expiry_date === '' || 
      medicine.expiry_date === searchFilters.expiry_date;
    
    return matchesName && matchesCategory && matchesExpiryDate;
  });

  const getCategoryDisplayName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Stock Management</h1>
          <p className="text-gray-600">Manage and track medicine inventory</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Medicine</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicine-name">Medicine Name</Label>
                <Input
                  id="medicine-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="syrup">Syrup</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  required
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add Medicine'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Medicine Stock</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Search by Name</Label>
                <Input
                  placeholder="Medicine Name"
                  value={searchFilters.name}
                  onChange={(e) => setSearchFilters({...searchFilters, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Filter by Category</Label>
                <Select value={searchFilters.category} onValueChange={(value) => setSearchFilters({...searchFilters, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="syrup">Syrup</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Filter by Expiry Date</Label>
                <Input
                  type="date"
                  value={searchFilters.expiry_date}
                  onChange={(e) => setSearchFilters({...searchFilters, expiry_date: e.target.value})}
                />
              </div>
            </div>

            {/* Medicine Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity in Stock</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No medicines found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMedicines.map((medicine) => (
                      <TableRow 
                        key={medicine.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(medicine)}
                      >
                        <TableCell>{medicine.serial_number}</TableCell>
                        <TableCell className="font-medium">{medicine.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            medicine.category === 'tablet' ? 'bg-blue-100 text-blue-800' :
                            medicine.category === 'syrup' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {getCategoryDisplayName(medicine.category)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            medicine.total_quantity < 10 ? 'text-red-600' : 
                            medicine.total_quantity < 50 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {medicine.total_quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(medicine.last_updated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(medicine);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineStockPage;

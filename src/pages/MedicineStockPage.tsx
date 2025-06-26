
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
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

  const handleDeleteMedicine = (medicineId: string) => {
    deleteMedicineMutation.mutate(medicineId);
  };

  const downloadPDF = () => {
    const pdfContent = `
Medicine Stock Inventory Report
Generated on: ${new Date().toLocaleDateString()}

${filteredMedicines.map((medicine, index) => `
${index + 1}. ${medicine.name}
   Serial No: ${medicine.serial_number}
   Category: ${medicine.category}
   Quantity in Stock: ${medicine.total_quantity}
   Expiry Date: ${medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
   Last Updated: ${new Date(medicine.last_updated).toLocaleDateString()}
`).join('\n')}

Total Medicines: ${filteredMedicines.length}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicine-stock-report-${new Date().toISOString().split('T')[0]}.txt`;
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

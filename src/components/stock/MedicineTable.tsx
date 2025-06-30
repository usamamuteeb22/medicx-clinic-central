
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
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

interface MedicineTableProps {
  medicines: Medicine[];
}

const MedicineTable = ({ medicines }: MedicineTableProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleDeleteMedicine = async (medicineId: string, medicineName: string) => {
    try {
      console.log('Attempting to delete medicine:', medicineId, medicineName);
      
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', medicineId);

      if (error) {
        console.error('Error deleting medicine:', error);
        throw error;
      }

      toast({
        title: "Medicine Deleted",
        description: `${medicineName} has been successfully deleted.`
      });

      // Refresh the medicines list
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete medicine. Please try again."
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tablet':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'syrup':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'injection':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { color: 'bg-red-100 text-red-800 border-red-300', text: 'Out of Stock' };
    } else if (quantity < 10) {
      return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Low Stock' };
    } else {
      return { color: 'bg-green-100 text-green-800 border-green-300', text: 'In Stock' };
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-700">Medicine Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-purple-200">
                <th className="text-left p-3 font-medium text-purple-700">Serial No.</th>
                <th className="text-left p-3 font-medium text-purple-700">Medicine Name</th>
                <th className="text-left p-3 font-medium text-purple-700">Category</th>
                <th className="text-left p-3 font-medium text-purple-700">Stock Qty</th>
                <th className="text-left p-3 font-medium text-purple-700">Status</th>
                <th className="text-left p-3 font-medium text-purple-700">Expiry Date</th>
                <th className="text-left p-3 font-medium text-purple-700">Last Updated</th>
                <th className="text-left p-3 font-medium text-purple-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.total_quantity);
                return (
                  <tr key={medicine.id} className="border-b hover:bg-purple-50 transition-colors">
                    <td className="p-3">
                      <Badge variant="outline" className="border-purple-300 text-purple-700">
                        {medicine.serial_number}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">{medicine.name}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={getCategoryColor(medicine.category)}>
                        {medicine.category}
                      </Badge>
                    </td>
                    <td className="p-3 font-semibold">{medicine.total_quantity}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={stockStatus.color}>
                        {stockStatus.text}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      {new Date(medicine.last_updated).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/medicines/${medicine.id}`)}
                          className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(user?.role === 'admin' || user?.role === 'pharmacy') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                              >
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
                                  onClick={() => handleDeleteMedicine(medicine.id, medicine.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineTable;

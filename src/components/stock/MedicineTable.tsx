
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
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

interface MedicineTableProps {
  medicines: Medicine[];
}

const MedicineTable = ({ medicines }: MedicineTableProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const deleteMedicineMutation = useMutation({
    mutationFn: async (medicineId: string) => {
      // First check if medicine is referenced in medicine_usage
      const { data: usageData, error: usageError } = await supabase
        .from('medicine_usage')
        .select('id')
        .eq('medicine_id', medicineId)
        .limit(1);

      if (usageError) throw usageError;

      if (usageData && usageData.length > 0) {
        throw new Error('Cannot delete medicine that has been used in patient treatments. Please remove usage records first.');
      }

      // Check if medicine is referenced in medicine_prescriptions
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('medicine_prescriptions')
        .select('id')
        .eq('medicine_id', medicineId)
        .limit(1);

      if (prescriptionError) throw prescriptionError;

      if (prescriptionData && prescriptionData.length > 0) {
        throw new Error('Cannot delete medicine that is prescribed in patient reports. Please remove prescriptions first.');
      }

      // Check if medicine is referenced in medicine_stock_history
      const { data: stockData, error: stockError } = await supabase
        .from('medicine_stock_history')
        .select('id')
        .eq('medicine_id', medicineId)
        .limit(1);

      if (stockError) throw stockError;

      if (stockData && stockData.length > 0) {
        throw new Error('Cannot delete medicine that has stock history. Please remove stock history first.');
      }

      // If no references found, proceed with deletion
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
        title: "Cannot Delete Medicine",
        description: error.message || "Failed to delete medicine. Please try again."
      });
    }
  });

  const handleDeleteMedicine = (medicineId: string) => {
    deleteMedicineMutation.mutate(medicineId);
  };

  return (
    <Card>
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
              {medicines.map((medicine) => (
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
                              Are you sure you want to delete {medicine.name}? This action cannot be undone and will only work if the medicine is not referenced in any patient records or usage history.
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
  );
};

export default MedicineTable;

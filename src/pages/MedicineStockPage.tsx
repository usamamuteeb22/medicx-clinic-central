
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import MedicineSearchSection from '@/components/stock/MedicineSearchSection';
import StockManagementSection from '@/components/stock/StockManagementSection';
import MedicineTable from '@/components/stock/MedicineTable';
import AddMedicineModal from '@/components/stock/AddMedicineModal';
import EditMedicineModal from '@/components/stock/EditMedicineModal';
import StockHistoryTable from '@/components/stock/StockHistoryTable';
import { Pill } from 'lucide-react';

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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'tablet' | 'syrup' | 'injection' | 'sachet' | 'drops' | 'lotion' | 'cream' | 'ointment' | 'suspension' | 'gel' | 'infusion' | 'transfusion' | 'Capsule'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const { data: medicines = [], isLoading, refetch } = useQuery({
    queryKey: ['medicines', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('medicines')
        .select('*')
        .order('serial_number', { ascending: true });

      if (searchTerm) {
        // Search in both name and category, or combined format "category - medicine name"
        const searchLower = searchTerm.toLowerCase();
        query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedMedicine(null);
  };

  const handleMedicineUpdated = () => {
    refetch();
    handleCloseEditModal();
  };

  if (!user || (user.role !== 'admin' && user.role !== 'pharmacy')) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only Admin and Pharmacy users can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Stock Management</h1>
          <p className="text-gray-600">Manage your medicine inventory and stock levels</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Pill className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      {/* Search and Filter Section */}
      <MedicineSearchSection
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Stock Management Section */}
      <StockManagementSection medicines={medicines} />

      {/* Medicine Table */}
      <MedicineTable 
        medicines={medicines} 
        onEditMedicine={handleEditMedicine}
      />

      {/* Stock History */}
      <StockHistoryTable />

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onMedicineAdded={refetch}
      />

      {/* Edit Medicine Modal */}
      <EditMedicineModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        medicine={selectedMedicine}
        onMedicineUpdated={handleMedicineUpdated}
      />
    </div>
  );
};

export default MedicineStockPage;

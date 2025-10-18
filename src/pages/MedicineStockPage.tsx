
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import MedicineInventorySearch from '@/components/stock/MedicineInventorySearch';
import StockManagementSection from '@/components/stock/StockManagementSection';
import MedicineTable from '@/components/stock/MedicineTable';
import MedicinePagination from '@/components/stock/MedicinePagination';
import AddMedicineModal from '@/components/stock/AddMedicineModal';
import EditMedicineModal from '@/components/stock/EditMedicineModal';
import StockHistoryTable from '@/components/stock/StockHistoryTable';
import { Pill, Package } from 'lucide-react';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: allMedicines = [], isLoading, refetch } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('serial_number', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Filter medicines based on search term
  const filteredMedicines = useMemo(() => {
    if (!searchTerm.trim()) return allMedicines;
    
    return allMedicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allMedicines, searchTerm]);

  // Paginate the filtered medicines
  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMedicines.slice(startIndex, endIndex);
  }, [filteredMedicines, currentPage]);

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

  // Reset to page 1 when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Medicine Stock</h1>
            <p className="text-muted-foreground">Manage your medicine inventory</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          <Pill className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      {/* Stock Management Section */}
      <StockManagementSection medicines={allMedicines} />

      {/* Medicine Inventory Search */}
      <div className="space-y-4">
        <MedicineInventorySearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Stats */}
        <div className="flex justify-between items-center px-1">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedMedicines.length} of {filteredMedicines.length} medicines
          </p>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="text-sm"
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Medicine Table */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading medicines...
            </CardContent>
          </Card>
        ) : filteredMedicines.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchTerm ? 'No medicines found matching your search.' : 'No medicines available.'}
            </CardContent>
          </Card>
        ) : (
          <>
            <MedicineTable 
              medicines={paginatedMedicines} 
              onEditMedicine={handleEditMedicine}
            />
            <MedicinePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

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

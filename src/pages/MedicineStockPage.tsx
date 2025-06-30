
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicineSearchSection from '@/components/stock/MedicineSearchSection';
import MedicineTable from '@/components/stock/MedicineTable';
import { generateMedicineStockPDF } from '@/utils/medicineStockPdfUtils';
import AddMedicineModal from '@/components/stock/AddMedicineModal';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

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

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.serial_number.toString().includes(searchTerm)
  );

  const handleDownloadPDF = () => {
    generateMedicineStockPDF(filteredMedicines);
  };

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
          <Button onClick={handleDownloadPDF} variant="outline" className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      <MedicineSearchSection searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <MedicineTable medicines={filteredMedicines} />
      
      <AddMedicineModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  );
};

export default MedicineStockPage;

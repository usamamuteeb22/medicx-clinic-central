import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MedicineInventorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const MedicineInventorySearch: React.FC<MedicineInventorySearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search medicine by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>
    </div>
  );
};

export default MedicineInventorySearch;

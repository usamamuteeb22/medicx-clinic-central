
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MedicineSearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const MedicineSearchSection = ({ searchTerm, onSearchChange }: MedicineSearchSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Medicines</CardTitle>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, category, or serial number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardHeader>
    </Card>
  );
};

export default MedicineSearchSection;

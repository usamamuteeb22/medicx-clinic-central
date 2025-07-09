
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface MedicineSearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (value: string) => void;
}

const MedicineSearchSection: React.FC<MedicineSearchSectionProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter = '',
  onCategoryFilterChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search & Filter Medicines</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Search by Name or Serial Number</Label>
            <Input
              placeholder="Enter medicine name or serial number..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          {onCategoryFilterChange && (
            <div className="space-y-2">
              <Label>Filter by Category</Label>
              <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="syrup">Syrup</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="gel">Gel</SelectItem>
                  <SelectItem value="ointment">Ointment</SelectItem>
                  <SelectItem value="cream">Cream</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="drops">Drops</SelectItem>
                  <SelectItem value="sachet">Sachet</SelectItem>
                  <SelectItem value="infusion">Infusion</SelectItem>
                  <SelectItem value="transfusion">Transfusion</SelectItem>
                  <SelectItem value="lotion">Lotion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineSearchSection;

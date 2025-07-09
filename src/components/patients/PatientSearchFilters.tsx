
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchFilters {
  id: string;
  name: string;
  phone: string;
  category: string;
}

interface PatientSearchFiltersProps {
  searchFilters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const PatientSearchFilters: React.FC<PatientSearchFiltersProps> = ({ 
  searchFilters, 
  onFiltersChange 
}) => {
  const updateFilter = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...searchFilters, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>Search by ID</Label>
        <Input
          placeholder="Patient ID"
          value={searchFilters.id}
          onChange={(e) => updateFilter('id', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Search by Name</Label>
        <Input
          placeholder="Patient Name"
          value={searchFilters.name}
          onChange={(e) => updateFilter('name', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Search by Phone</Label>
        <Input
          placeholder="Phone Number"
          value={searchFilters.phone}
          onChange={(e) => updateFilter('phone', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Search by Category</Label>
        <Select value={searchFilters.category} onValueChange={(value) => updateFilter('category', value || 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="Thalassemic">Thalassemic</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PatientSearchFilters;

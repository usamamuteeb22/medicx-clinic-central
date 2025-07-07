
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ReportsSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const ReportsSearchBar: React.FC<ReportsSearchBarProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by patient name or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsSearchBar;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MedicineUsageFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  endDate: Date | undefined;
  onEndDateChange: (date: Date | undefined) => void;
}

const MedicineUsageFilters = ({
  searchTerm,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange
}: MedicineUsageFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Starting Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={onStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Ending Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={onEndDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex gap-2">
            {startDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStartDateChange(undefined)}
              >
                Clear Start Date
              </Button>
            )}
            {endDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEndDateChange(undefined)}
              >
                Clear End Date
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineUsageFilters;

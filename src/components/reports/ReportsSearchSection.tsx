
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Calendar, Eye, RotateCcw } from 'lucide-react';
import { PatientReport } from '@/types/reportTypes';
import { toast } from '@/hooks/use-toast';
import ReportsPagination from './ReportsPagination';

interface ReportsSearchSectionProps {
  onReportSelect: (report: PatientReport) => void;
}

const RECORDS_PER_PAGE = 10;

const ReportsSearchSection: React.FC<ReportsSearchSectionProps> = ({ onReportSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchResults, setSearchResults] = useState<PatientReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const searchReports = async (page = 1) => {
    setLoading(true);
    try {
      let query = supabase
        .from('patient_reports')
        .select('*', { count: 'exact' })
        .not('created_by_role', 'is', null)
        .order('created_at', { ascending: false });

      // Apply date filters
      if (startDate) {
        query = query.gte('created_at', startDate + 'T00:00:00.000Z');
      }
      if (endDate) {
        query = query.lte('created_at', endDate + 'T23:59:59.999Z');
      }

      // Apply pagination
      const from = (page - 1) * RECORDS_PER_PAGE;
      const to = from + RECORDS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: reportsData, error: reportsError, count } = await query;
      if (reportsError) throw reportsError;

      setTotalCount(count || 0);

      if (!reportsData || reportsData.length === 0) {
        setSearchResults([]);
        return;
      }

      // Get unique patient IDs
      const patientIds = [...new Set(reportsData.map(report => report.patient_id))];

      // Fetch patient details
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds);

      if (patientsError) throw patientsError;

      // Create patient map
      const patientMap = new Map(patientsData?.map(p => [p.id, p]) || []);

      // Combine reports with patient data
      const reportsWithPatients: PatientReport[] = reportsData.map(report => ({
        ...report,
        patient: patientMap.get(report.patient_id)
      })).filter(report => report.patient);

      // Apply search filter
      let filteredResults = reportsWithPatients;
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filteredResults = reportsWithPatients.filter(report => 
          report.patient?.name?.toLowerCase().includes(searchLower) ||
          report.patient?.patient_id?.toString().includes(searchTerm) ||
          report.patient?.phone_number?.toLowerCase().includes(searchLower) ||
          report.patient?.age?.toString().includes(searchTerm)
        );
      }

      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Error searching reports:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search reports"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    searchReports(1);
  }, [searchTerm, startDate, endDate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    searchReports(page);
  };

  const handleResetDates = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { dateStr, timeStr };
  };

  const totalPages = Math.ceil(totalCount / RECORDS_PER_PAGE);

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Search className="h-6 w-6" />
          </div>
          <span className="text-xl">Search Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          <Input
            type="text"
            placeholder="🔍 Search by patient name, ID, phone number, or age..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-4 text-lg border-2 border-gray-200 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 rounded-xl shadow-sm"
          />
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Start Date:</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">End Date:</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button 
            onClick={handleResetDates}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Dates</span>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Searching reports...</p>
          </div>
        )}

        {/* Results Table */}
        {!loading && searchResults.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Patient ID</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Age</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Time</TableHead>
                    <TableHead className="font-semibold">Phone Number</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((report) => {
                    const { dateStr, timeStr } = formatDateTime(report.created_at);
                    return (
                      <TableRow key={report.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{report.patient?.patient_id || 'N/A'}</TableCell>
                        <TableCell>{report.patient?.name || 'Unknown'}</TableCell>
                        <TableCell>{report.patient?.age || 'N/A'}</TableCell>
                        <TableCell>{dateStr}</TableCell>
                        <TableCell>{timeStr}</TableCell>
                        <TableCell>{report.patient?.phone_number || 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() => onReportSelect(report)}
                            size="sm"
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Preview Report</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <ReportsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalRecords={totalCount}
                recordsPerPage={RECORDS_PER_PAGE}
              />
            )}
          </>
        )}

        {/* No Results */}
        {!loading && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchTerm || startDate || endDate 
                ? 'No reports found matching your criteria.' 
                : 'No reports available.'}
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && totalCount > 0 && (
          <div className="text-sm text-gray-600 text-center">
            Found {totalCount} report{totalCount !== 1 ? 's' : ''}
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsSearchSection;

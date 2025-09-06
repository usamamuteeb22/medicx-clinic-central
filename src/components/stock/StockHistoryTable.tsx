
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import StockHistoryPagination from './StockHistoryPagination';

interface StockHistory {
  id: string;
  medicine_id: string;
  stock_type: string;
  quantity: number;
  created_at: string;
  created_by: string;
  expiry_date?: string;
  medicine_name: string;
  patient_name?: string;
}

interface StockHistoryTableProps {
  medicineId?: string;
}

const RECORDS_PER_PAGE = 10;

const StockHistoryTable: React.FC<StockHistoryTableProps> = ({ medicineId }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: stockHistoryData, isLoading, error } = useQuery({
    queryKey: ['stockHistory', medicineId, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('medicine_stock_history')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (medicineId) {
        query = query.eq('medicine_id', medicineId);
      }

      // Apply pagination
      const from = (currentPage - 1) * RECORDS_PER_PAGE;
      const to = from + RECORDS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: historyData, error: historyError, count } = await query;
      if (historyError) throw historyError;

      if (!historyData || historyData.length === 0) {
        return { stockHistory: [], totalCount: 0 };
      }

      // Get medicine names
      const medicineIds = [...new Set(historyData.map(h => h.medicine_id))];
      const { data: medicinesData, error: medicinesError } = await supabase
        .from('medicines')
        .select('id, name')
        .in('id', medicineIds);

      if (medicinesError) throw medicinesError;

      const medicineMap = new Map(medicinesData?.map(m => [m.id, m.name]) || []);

      // For stock reductions (type 'remove'), get patient names from medicine_usage
      const usageRecords = historyData.filter(h => h.stock_type === 'remove');
      let patientMap = new Map();
      let userMap = new Map();

      // Get user information for all records
      const userIds = [...new Set(historyData.map(h => h.created_by).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, username')
          .in('id', userIds);
        
        if (!usersError && usersData) {
          userMap = new Map(usersData.map(u => [u.id, u.full_name || u.username || 'Unknown User']));
        }
      }

      if (usageRecords.length > 0) {
        // Get medicine usage records to find patient info
        const { data: usageData, error: usageError } = await supabase
          .from('medicine_usage')
          .select('medicine_id, patient_id, created_by, usage_date')
          .in('medicine_id', usageRecords.map(r => r.medicine_id));

        if (usageError) {
          console.error('Error fetching usage data:', usageError);
        } else if (usageData && usageData.length > 0) {
          // Get patient names
          const patientIds = [...new Set(usageData.map(u => u.patient_id))];
          const { data: patientsData, error: patientsError } = await supabase
            .from('patients')
            .select('id, name')
            .in('id', patientIds);

          if (!patientsError && patientsData) {
            const patientNamesMap = new Map(patientsData.map(p => [p.id, p.name]));
            
            // Create a map from medicine_id and created_by to patient name
            usageData.forEach(usage => {
              const patient = patientNamesMap.get(usage.patient_id);
              if (patient) {
                const key = `${usage.medicine_id}_${usage.created_by}`;
                patientMap.set(key, patient);
              }
            });
          }
        }
      }

      // Combine data
      const stockHistory: StockHistory[] = historyData.map(history => {
        const medicineName = medicineMap.get(history.medicine_id) || 'Unknown Medicine';
        const userName = userMap.get(history.created_by) || 'Unknown User';
        let displayName = userName;
        
        if (history.stock_type === 'remove') {
          const key = `${history.medicine_id}_${history.created_by}`;
          const patientName = patientMap.get(key);
          if (patientName) {
            displayName = `${patientName} (via ${userName})`;
          }
        }

        return {
          ...history,
          medicine_name: medicineName,
          patient_name: displayName
        };
      });

      return { stockHistory, totalCount: count || 0 };
    }
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStockTypeColor = (type: string) => {
    return type === 'add' 
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Stock History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Stock History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading stock history</p>
        </CardContent>
      </Card>
    );
  }

  const { stockHistory = [], totalCount = 0 } = stockHistoryData || {};
  const totalPages = Math.ceil(totalCount / RECORDS_PER_PAGE);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Stock History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stockHistory.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Medicine</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Quantity</th>
                    <th className="text-left p-3 font-medium">User/Patient</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory.map((history) => (
                    <tr key={history.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{history.medicine_name}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={getStockTypeColor(history.stock_type)}>
                          {history.stock_type === 'add' ? 'Added' : 'Removed'}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold">
                        {history.stock_type === 'add' ? '+' : '-'}{history.quantity}
                      </td>
                      <td className="p-3">
                        {history.stock_type === 'remove' 
                          ? history.patient_name 
                          : history.stock_type === 'add' 
                          ? history.patient_name
                          : 'N/A'}
                      </td>
                      <td className="p-3">{formatDate(history.created_at)}</td>
                      <td className="p-3">
                        {history.expiry_date ? new Date(history.expiry_date).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4">
                <StockHistoryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalRecords={totalCount}
                  recordsPerPage={RECORDS_PER_PAGE}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-4">No stock history found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StockHistoryTable;

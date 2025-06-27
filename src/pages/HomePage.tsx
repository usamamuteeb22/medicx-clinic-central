
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { Users, Pill, FileText, Activity } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();

  // Fetch daily patient counts for the last 7 days
  const { data: dailyPatients = [] } = useQuery({
    queryKey: ['daily-patients'],
    queryFn: async () => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), i));
        return {
          date,
          formattedDate: format(date, 'MMM dd'),
          sqlDate: format(date, 'yyyy-MM-dd')
        };
      }).reverse();

      const results = await Promise.all(
        last7Days.map(async ({ date, formattedDate, sqlDate }) => {
          const { count } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .gte('registration_date', sqlDate)
            .lt('registration_date', format(new Date(date.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
          
          return {
            date: formattedDate,
            patients: count || 0
          };
        })
      );

      return results;
    }
  });

  // Fetch low stock medicines (less than 30 units)
  const { data: lowStockMedicines = [] } = useQuery({
    queryKey: ['low-stock-medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('name, total_quantity')
        .lt('total_quantity', 30)
        .order('total_quantity', { ascending: true })
        .limit(30);

      if (error) throw error;

      return data.map(medicine => ({
        name: medicine.name.length > 15 ? medicine.name.substring(0, 15) + '...' : medicine.name,
        stock: medicine.total_quantity || 0
      }));
    }
  });

  // Fetch summary statistics
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [patientsResult, medicinesResult, reportsResult] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('medicines').select('*', { count: 'exact', head: true }),
        supabase.from('patient_reports').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalPatients: patientsResult.count || 0,
        totalMedicines: medicinesResult.count || 0,
        totalReports: reportsResult.count || 0
      };
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Medicx Dashboard</h1>
        <p className="text-gray-600">Hello, {user?.full_name} ({user?.role})</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMedicines || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReports || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Patients Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Daily Patients Count (Last 7 Days)</CardTitle>
          <CardDescription>Number of patients registered each day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyPatients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Medicines Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Low Stock Medicines (Below 30 Units)</CardTitle>
          <CardDescription>Medicines with stock less than 30 units - Lowest to Highest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lowStockMedicines} layout="horizontal" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip />
                <Bar dataKey="stock" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Footer - Only on Home Page */}
      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="text-center text-sm text-gray-600">
          This Website is Developed by Usama Muteeb
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

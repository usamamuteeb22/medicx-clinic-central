
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Users, Pill, FileText } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();

  // Fetch daily patient counts for the current month
  const { data: dailyPatients = [] } = useQuery({
    queryKey: ['daily-patients-month'],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const results = await Promise.all(
        daysInMonth.map(async (date) => {
          const sqlDate = format(date, 'yyyy-MM-dd');
          const nextDay = format(new Date(date.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
          
          const { count } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .gte('registration_date', sqlDate)
            .lt('registration_date', nextDay);
          
          return {
            date: format(date, 'MMM dd'),
            patients: count || 0
          };
        })
      );

      return results;
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

      {/* Daily Patients Chart - Updated to show whole month */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Daily Patients Count (Current Month)</CardTitle>
          <CardDescription>Number of patients registered each day this month</CardDescription>
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

      {/* Footer - Updated with red text color */}
      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="text-center text-sm text-red-600">
          This Website is Developed by Usama Muteeb
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

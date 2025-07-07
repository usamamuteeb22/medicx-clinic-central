
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'doctor' | 'reception' | 'pharmacy';
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('medicx_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid username or password"
        });
        return false;
      }

      // Check credentials for each role
      let isValidCredentials = false;
      
      switch (username) {
        case 'ummi':
          isValidCredentials = password === 'ummi999';
          break;
        case 'reception':
          isValidCredentials = password === '4568';
          break;
        case 'doctor':
          isValidCredentials = password === '7891';
          break;
        case 'pharmacy':
          isValidCredentials = password === '1235';
          break;
        default:
          isValidCredentials = false;
      }

      if (isValidCredentials) {
        const user: User = {
          id: data.id,
          username: data.username,
          role: data.role,
          full_name: data.full_name || data.username
        };
        
        setUser(user);
        localStorage.setItem('medicx_user', JSON.stringify(user));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.full_name}!`
        });
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid username or password"
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An error occurred during login"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medicx_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

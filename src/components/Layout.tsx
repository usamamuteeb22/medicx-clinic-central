
import React, { memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return null; // This will be handled by the main App component
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;

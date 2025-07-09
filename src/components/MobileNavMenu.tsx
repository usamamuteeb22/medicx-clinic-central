
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileNavMenuProps {
  navigationItems: NavigationItem[];
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ navigationItems }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-semibold">Navigation</span>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full justify-start space-x-3 h-12"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="border-t p-4 space-y-4">
            <div className="text-sm text-gray-600">
              Welcome, {user?.full_name} ({user?.role})
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start space-x-3"
            >
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavMenu;

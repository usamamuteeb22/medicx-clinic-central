
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, UserPlus, Pill, Stethoscope, FileText, History, BarChart3, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileNavMenu from './MobileNavMenu';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/', label: 'Home', icon: Home }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { path: '/patients', label: 'Add Patient', icon: UserPlus },
          { path: '/all-patients', label: 'Patients', icon: Users },
          { path: '/reception-reports', label: 'Reception Reports', icon: FileText },
          { path: '/patient-reports', label: 'Patient Reports', icon: Stethoscope },
          { path: '/reports', label: 'Reports', icon: BarChart3 },
          { path: '/medicine-usage', label: 'Medicine Usage', icon: History },
          { path: '/medicines', label: 'Medicine Stock', icon: Pill }
        ];
      case 'reception':
        return [
          ...baseItems,
          { path: '/patients', label: 'Add Patient', icon: UserPlus },
          { path: '/all-patients', label: 'Patients', icon: Users },
          { path: '/reception-reports', label: 'Reception Reports', icon: FileText },
          { path: '/reports', label: 'Reports', icon: BarChart3 }
        ];
      case 'doctor':
        return [
          ...baseItems,
          { path: '/all-patients', label: 'Patients', icon: Users },
          { path: '/patient-reports', label: 'Patient Reports', icon: Stethoscope },
          { path: '/reports', label: 'Reports', icon: BarChart3 },
          { path: '/medicine-usage', label: 'Medicine Usage', icon: History }
        ];
      case 'pharmacy':
        return [
          ...baseItems,
          { path: '/medicines', label: 'Medicine Stock', icon: Pill },
          { path: '/medicine-usage', label: 'Medicine Usage', icon: History }
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Mobile Menu - Left aligned */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Medicx</span>
            </div>
            
            {/* Mobile Navigation */}
            <MobileNavMenu navigationItems={navigationItems} />
          </div>
          
          {/* Desktop Navigation - Left aligned, smaller text */}
          <div className="hidden md:flex space-x-1 lg:space-x-2 flex-1 justify-start ml-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-1 text-xs lg:text-sm px-2 lg:px-3 h-8"
                  size="sm"
                >
                  <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden lg:inline truncate max-w-24">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* User Info and Logout - Right aligned */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <span className="text-xs lg:text-sm text-gray-600 max-w-28 lg:max-w-none truncate">
              {user?.full_name} ({user?.role})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-1 lg:space-x-2 h-8"
            >
              <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline text-xs">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

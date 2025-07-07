
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Users, 
  FileText, 
  Package, 
  Activity, 
  LogOut, 
  Menu,
  X,
  Stethoscope
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard', roles: ['admin', 'doctor', 'reception', 'pharmacy'] },
    { to: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'doctor', 'reception'] },
    { to: '/add-patient', icon: Users, label: 'Add Patient', roles: ['admin', 'reception'] },
    { to: '/reception-reports', icon: Stethoscope, label: 'Reception Reports', roles: ['reception'] },
    { to: '/patient-reports', icon: FileText, label: 'Patient Reports', roles: ['admin', 'doctor'] },
    { to: '/reports', icon: FileText, label: 'All Reports', roles: ['admin'] },
    { to: '/medicine-stock', icon: Package, label: 'Medicine Stock', roles: ['admin', 'pharmacy', 'doctor'] },
    { to: '/medicine-usage', icon: Activity, label: 'Medicine Usage', roles: ['admin', 'pharmacy', 'doctor'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user.role)
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white text-xl font-bold">
              Medical System
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                    isActive(item.to)
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info and Logout (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-blue-100 text-sm">
              <span className="font-medium">{user.full_name || user.username}</span>
              <span className="ml-2 px-2 py-1 bg-blue-700 rounded text-xs uppercase">
                {user.role}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-blue-100 hover:text-white hover:bg-blue-500"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-blue-100 hover:text-white hover:bg-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-600 border-t border-blue-500">
              {/* User Info (Mobile) */}
              <div className="px-3 py-2 text-blue-100 text-sm border-b border-blue-500 mb-2">
                <div className="font-medium">{user.full_name || user.username}</div>
                <div className="mt-1">
                  <span className="px-2 py-1 bg-blue-700 rounded text-xs uppercase">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Navigation Items (Mobile) */}
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-2 ${
                      isActive(item.to)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Logout (Mobile) */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-500 hover:text-white transition-colors duration-200 flex items-center space-x-2 mt-2 border-t border-blue-500 pt-4"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

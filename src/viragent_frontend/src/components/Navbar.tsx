import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Upload,
  Brain,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, principal } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/ai-review', label: 'AI Review', icon: Brain },
    { path: '/schedule', label: 'Schedule', icon: Calendar },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.nav
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-space-grotesk font-bold text-xl gradient-text">
              Viragent
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-primary/10"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {principal?.toString().slice(0, 8)}...
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden pb-4 border-t border-border/50 mt-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="space-y-2 pt-4">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-2"
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
              
              <div className="border-t border-border/50 pt-2 mt-2">
                <div className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{principal?.toString().slice(0, 8)}...</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start flex items-center space-x-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
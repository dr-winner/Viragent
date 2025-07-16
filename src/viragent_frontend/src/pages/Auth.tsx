import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wallet, 
  Mail, 
  Lock, 
  Shield, 
  ArrowRight,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, isLoading, principal } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleWalletConnect = async (walletType: 'internet-identity' | 'plug' | 'stoic') => {
    if (walletType === 'internet-identity') {
      try {
        await login();
      } catch (error) {
        console.error('Internet Identity login failed:', error);
      }
    } else {
      // For other wallets, show coming soon message
      toast({
        title: "Coming Soon!",
        description: `${walletType} integration is coming soon. Use Internet Identity for now.`,
      });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show coming soon message for email auth
    toast({
      title: "Coming Soon!",
      description: "Email authentication is coming soon. Please use Internet Identity for now.",
    });
  };

  const walletOptions = [
    {
      id: 'internet-identity',
      name: 'Internet Identity',
      icon: '◇',
      description: 'Secure Web3 authentication',
      primary: true
    },
    {
      id: 'plug',
      name: 'Plug Wallet',
      icon: '🔌',
      description: 'Popular ICP wallet'
    },
    {
      id: 'stoic',
      name: 'Stoic Wallet',
      icon: '⚡',
      description: 'Community favorite'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Card className="glass-card p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-3xl font-space-grotesk font-bold gradient-text">
                Welcome to Viragent
              </h1>
              <p className="text-muted-foreground">
                {authMode === 'login' 
                  ? 'Sign in to your account' 
                  : 'Create your Web3 account'
                }
              </p>
            </motion.div>
          </div>

          {/* Web3 Wallet Options */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Label className="text-sm font-medium">Connect with Web3 Wallet</Label>
            {walletOptions.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <Button
                  variant={wallet.primary ? "web3" : "glass"}
                  className="w-full justify-start h-auto p-4 group"
                  onClick={() => handleWalletConnect(wallet.id as any)}
                  disabled={isLoading || (wallet.id !== 'internet-identity')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{wallet.icon}</div>
                    <div className="text-left">
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-xs opacity-70">
                        {wallet.id === 'internet-identity' 
                          ? wallet.description 
                          : 'Coming soon...'
                        }
                      </div>
                    </div>
                  </div>
                  {isLoading && wallet.id === 'internet-identity' ? (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Authentication Form */}
          <motion.form
            onSubmit={handleEmailAuth}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="web3-input pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="web3-input pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="web3-input pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="web3"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </motion.form>

          {/* Auth Mode Toggle */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">
              {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="ml-1 text-primary hover:text-primary-glow font-medium transition-colors"
              >
                {authMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>

          {/* Security Note */}
          <motion.div
            className="text-center p-3 rounded-lg bg-muted/50 border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Secured by Internet Computer Protocol</span>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
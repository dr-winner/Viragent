import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useToast } from '@/hooks/use-toast';
import { backendService } from '@/services/backend';

interface AuthContextType {
  isAuthenticated: boolean;
  identity: Identity | null;
  principal: Principal | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isBackendReady: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const { toast } = useToast();

  // Internet Computer mainnet identity provider
  const identityProvider = import.meta.env.MODE === 'production'
    ? 'https://identity.ic0.app'
    : 'http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai';

  useEffect(() => {
    initAuthClient();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initBackendService = async (identity: Identity) => {
    try {
      console.log('🔄 Initializing backend service...');
      await backendService.init(identity);
      console.log('✅ Backend service initialized');
      
      // Auto-register user if not already registered
      const isRegResult = await backendService.isRegistered();
      console.log('📋 Registration check result:', isRegResult);
      if (isRegResult.success && !isRegResult.data) {
        console.log('User not registered, auto-registering with Internet Identity...');
        const regResult = await backendService.autoRegister();
        if (regResult.success) {
          console.log('User auto-registered successfully:', regResult.data);
        } else {
          console.warn('Auto-registration failed:', regResult.error);
        }
      }
      
      setIsBackendReady(true);
      console.log('✅ Backend service ready');
    } catch (error) {
      console.error('❌ Failed to initialize backend service:', error);
      toast({
        title: "Backend Error",
        description: "Failed to connect to backend service. Some features may not work.",
        variant: "destructive"
      });
    }
  };

  const initAuthClient = async () => {
    try {
      console.log('🔄 Initializing auth client...');
      const client = await AuthClient.create();
      setAuthClient(client);

      const isAuth = await client.isAuthenticated();
      console.log('🔐 Authentication status:', isAuth);
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        console.log('👤 Principal:', principal.toString());
        setIdentity(identity);
        setPrincipal(principal);
        
        // Initialize backend service
        await initBackendService(identity);
      }
    } catch (error) {
      console.error('❌ Failed to initialize auth client:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to initialize authentication. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log('✅ Auth initialization complete');
    }
  };

  const login = async () => {
    if (!authClient) {
      toast({
        title: "Authentication Error",
        description: "Authentication client not initialized.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
          windowOpenerFeatures: 'toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100',
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            console.error('Login failed:', error);
            reject(error);
          }
        });
      });

      const isAuth = await authClient.isAuthenticated();
      if (isAuth) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();
        
        setIsAuthenticated(true);
        setIdentity(identity);
        setPrincipal(principal);

        // Initialize backend service
        await initBackendService(identity);

        toast({
          title: "Welcome to Viragent!",
          description: `Successfully authenticated with Internet Identity: ${principal.toString().slice(0, 8)}...`,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Failed to authenticate with Internet Identity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!authClient) return;

    try {
      setIsLoading(true);
      await authClient.logout();
      
      setIsAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
      setIsBackendReady(false);

      toast({
        title: "Logged Out",
        description: "Successfully logged out from Internet Identity.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "Failed to logout properly. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    identity,
    principal,
    login,
    logout,
    isLoading,
    isBackendReady
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

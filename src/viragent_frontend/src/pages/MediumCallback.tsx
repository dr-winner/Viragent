import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, BookOpen, ArrowRight } from "lucide-react";

export default function MediumCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      if (!state || !state.startsWith('medium_auth_')) {
        setStatus('error');
        setMessage('Invalid state parameter');
        return;
      }

      try {
        // Exchange code for access token
        const response = await fetch('/api/auth/medium/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            redirect_uri: `${window.location.origin}/auth/medium/callback`
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Store tokens
          localStorage.setItem('medium_access_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('medium_refresh_token', data.refresh_token);
          }
          
          // Store user info
          if (data.user) {
            localStorage.setItem('medium_user', JSON.stringify(data.user));
          }

          setStatus('success');
          setMessage('Successfully connected to Medium!');
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/social-accounts');
          }, 2000);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(errorData.error || 'Failed to exchange authorization code');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error during authentication');
        console.error('Medium auth error:', err);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-success" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-destructive" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Connecting to Medium...';
      case 'success':
        return 'Connected Successfully!';
      case 'error':
        return 'Connection Failed';
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'loading':
        return 'Please wait while we establish your connection...';
      case 'success':
        return 'You can now publish articles to Medium directly from Viragent.';
      case 'error':
        return 'We encountered an issue connecting your Medium account.';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="web3-card text-center">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <motion.div
                  animate={status === 'loading' ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: status === 'loading' ? Infinity : 0, ease: "linear" }}
                >
                  {getIcon()}
                </motion.div>
              </div>
              <h1 className="text-2xl font-space-grotesk font-bold mb-2">
                {getTitle()}
              </h1>
              <p className="text-muted-foreground">
                {getDescription()}
              </p>
            </div>

            {/* Status Content */}
            <div className="space-y-4 mb-6">
              {status === 'loading' && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Securely exchanging authorization tokens...
                  </p>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Alert className="bg-success/10 border-success/20 text-left">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success-foreground">
                      {message} Your Medium account is now connected and ready to use with Viragent's AI-powered content creation.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Alert variant="destructive" className="text-left">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {message}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="glass-card p-4 text-left">
                    <h4 className="font-medium text-sm mb-2">Troubleshooting Tips:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Ensure you have a valid Medium account</li>
                      <li>• Check that popup blockers are disabled</li>
                      <li>• Verify your internet connection</li>
                      <li>• Try clearing your browser cache</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button 
                    onClick={() => navigate('/social-accounts')} 
                    variant="web3"
                    size="lg"
                    className="w-full group"
                  >
                    Continue to Social Accounts
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button 
                    onClick={() => navigate('/auth/medium')} 
                    variant="web3"
                    size="lg"
                    className="w-full group"
                  >
                    <BookOpen className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => navigate('/social-accounts')} 
                    variant="glass"
                    className="w-full"
                  >
                    Skip for Now
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {status !== 'loading' && (
              <motion.div
                className="mt-6 pt-4 border-t border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-xs text-muted-foreground">
                  Need help? Visit our support documentation or contact our team.
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { socialMediaManager } from '@/services/social';

export default function TwitterCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Twitter authentication...');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        throw new Error(`Twitter OAuth error: ${error}`);
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state parameter');
      }

      // Complete the OAuth flow
      const connectionStatus = await socialMediaManager.completeConnection('twitter', code, state);
      
      setUserInfo(connectionStatus.userInfo);
      setStatus('success');
      setMessage('Successfully connected to Twitter!');

      // Notify parent window if opened in popup
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth_success',
          platform: 'twitter',
          userInfo: connectionStatus.userInfo
        }, window.location.origin);
        window.close();
      } else {
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/social-accounts');
        }, 2000);
      }

    } catch (error) {
      console.error('Twitter OAuth callback error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to connect to Twitter');

      // Notify parent window of error
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth_error',
          platform: 'twitter',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, window.location.origin);
        window.close();
      }
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-accent" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-success" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-destructive" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-accent/20 bg-accent/5';
      case 'success':
        return 'border-success/20 bg-success/5';
      case 'error':
        return 'border-destructive/20 bg-destructive/5';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className={`web3-card p-8 max-w-md w-full text-center ${getStatusColor()}`}>
        <div className="space-y-6">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>
          
          <div>
            <h1 className="text-2xl font-space-grotesk font-bold mb-2">
              {status === 'loading' && 'Connecting to Twitter'}
              {status === 'success' && 'Connection Successful!'}
              {status === 'error' && 'Connection Failed'}
            </h1>
            <p className="text-muted-foreground">{message}</p>
          </div>

          {userInfo && (
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-web3-purple rounded-full flex items-center justify-center text-lg">
                  🐦
                </div>
                <div className="text-left">
                  <p className="font-medium">{userInfo.name}</p>
                  <p className="text-sm text-muted-foreground">@{userInfo.username}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && !window.opener && (
            <div className="space-y-3">
              <Button 
                variant="web3" 
                onClick={() => navigate('/social-accounts')}
                className="w-full"
              >
                Return to Social Accounts
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCallback}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}

          {status === 'success' && !window.opener && (
            <p className="text-sm text-muted-foreground">
              Redirecting you back to Social Accounts...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
} 
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { socialMediaManager, SocialPlatform, ConnectionStatus } from "@/services/social";
import { CheckCircle, AlertCircle, ExternalLink, Unlink, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function SocialAccounts() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [connections, setConnections] = useState<Map<string, ConnectionStatus>>(new Map());
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPlatforms();
    loadConnections();
  }, []);

  const loadPlatforms = () => {
    const availablePlatforms = socialMediaManager.getPlatforms();
    setPlatforms(availablePlatforms);
  };

  const loadConnections = () => {
    const platformConnections = new Map<string, ConnectionStatus>();
    platforms.forEach(platform => {
      const status = socialMediaManager.getConnectionStatus(platform.id);
      if (status) {
        platformConnections.set(platform.id, status);
      }
    });
    setConnections(platformConnections);
  };

  const handleConnect = async (platformId: string) => {
    setIsConnecting(platformId);
    
    try {
      const authUrl = await socialMediaManager.initiateConnection(platformId);
      
      // Open OAuth popup window
      const popup = window.open(
        authUrl,
        `${platformId}_oauth`,
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for popup close or message
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(null);
          
          // Check if connection was successful
          setTimeout(() => {
            loadConnections();
          }, 1000);
        }
      }, 1000);

      // Listen for OAuth callback message
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'oauth_success' && event.data.platform === platformId) {
          popup.close();
          clearInterval(checkClosed);
          setIsConnecting(null);
          
          toast({
            title: "Connection Successful!",
            description: `Successfully connected to ${platforms.find(p => p.id === platformId)?.displayName}`,
          });
          
          loadConnections();
          window.removeEventListener('message', messageListener);
        } else if (event.data.type === 'oauth_error' && event.data.platform === platformId) {
          popup.close();
          clearInterval(checkClosed);
          setIsConnecting(null);
          
          toast({
            title: "Connection Failed",
            description: event.data.error || "Failed to connect to platform",
            variant: "destructive"
          });
          
          window.removeEventListener('message', messageListener);
        }
      };

      window.addEventListener('message', messageListener);

    } catch (error) {
      setIsConnecting(null);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to initiate connection",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      await socialMediaManager.disconnect(platformId);
      loadConnections();
      
      toast({
        title: "Disconnected",
        description: `Successfully disconnected from ${platforms.find(p => p.id === platformId)?.displayName}`,
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect",
        variant: "destructive"
      });
    }
  };

  const getPlatformStatus = (platform: SocialPlatform): 'connected' | 'disconnected' | 'error' => {
    const connection = connections.get(platform.id);
    if (connection?.error) return 'error';
    if (connection?.connected) return 'connected';
    return 'disconnected';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-success text-success-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-space-grotesk font-bold mb-2">
            Social Accounts
          </h1>
          <p className="text-muted-foreground">
            Connect your social media platforms to enable automated posting and scheduling
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="web3-card p-6 border-accent/20">
            <div className="flex items-start gap-4">
              <Info className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold mb-2">How Social Media Integration Works</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• <strong>Real OAuth2 Authentication:</strong> Secure connections using official platform APIs</p>
                  <p>• <strong>Platform-Specific Content:</strong> Automatic optimization for each social media platform</p>
                  <p>• <strong>Scheduling & Auto-Posting:</strong> Schedule posts across all connected platforms</p>
                  <p>• <strong>Content Guidelines:</strong> Built-in validation for platform-specific requirements</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform, index) => {
            const status = getPlatformStatus(platform);
            const connection = connections.get(platform.id);
            const isLoading = isConnecting === platform.id;

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <Card className="web3-card hover:web3-glow transition-all duration-300">
                  <div className="p-6 space-y-4">
                    
                    {/* Platform Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span 
                          style={{ fontSize: 32, color: platform.color }}
                          className="flex-shrink-0"
                        >
                          {platform.icon}
                        </span>
                        <div>
                          <h3 className="font-semibold text-lg">{platform.displayName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {platform.config.maxTextLength} char limit
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status}</span>
                      </Badge>
                    </div>

                    {/* Connection Info */}
                    {connection?.connected && connection.userInfo && (
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <div>
                            <p className="text-sm font-medium">
                              Connected as @{connection.userInfo.username || connection.userInfo.localizedFirstName || 'User'}
                            </p>
                            {connection.expiresAt && (
                              <p className="text-xs text-muted-foreground">
                                Expires: {new Date(connection.expiresAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Info */}
                    {connection?.error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <p className="text-sm text-destructive">{connection.error}</p>
                        </div>
                      </div>
                    )}

                    {/* Platform Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Supported Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          📝 Text Posts
                        </Badge>
                        {platform.config.supportsImages && (
                          <Badge variant="outline" className="text-xs">
                            🖼️ Images
                          </Badge>
                        )}
                        {platform.config.supportsVideos && (
                          <Badge variant="outline" className="text-xs">
                            🎥 Videos
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          📅 Scheduling
                        </Badge>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {status === 'connected' ? (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleDisconnect(platform.id)}
                          >
                            <Unlink className="mr-2 h-4 w-4" />
                            Disconnect
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => window.open(
                              platform.id === 'twitter' ? 'https://twitter.com' :
                              platform.id === 'instagram' ? 'https://instagram.com' :
                              platform.id === 'linkedin' ? 'https://linkedin.com' : '#'
                            )}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="web3" 
                          className="w-full group"
                          disabled={isLoading}
                          onClick={() => handleConnect(platform.id)}
                        >
                          {isLoading ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                              Connect to {platform.displayName}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Setup Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="web3-card">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Setup Instructions</h3>
              
              <div className="space-y-6">
                {/* Twitter Setup */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    🐦 Twitter/X API Setup
                  </h4>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>1. Go to <a href="https://developer.twitter.com" className="text-accent hover:underline" target="_blank">Twitter Developer Portal</a></li>
                    <li>2. Create a new app and get your Client ID and Client Secret</li>
                    <li>3. Add environment variables: VITE_TWITTER_CLIENT_ID and VITE_TWITTER_CLIENT_SECRET</li>
                    <li>4. Set callback URL to: {window.location.origin}/auth/twitter/callback</li>
                  </ol>
                </div>

                {/* Instagram Setup */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    📷 Instagram Basic Display API Setup
                  </h4>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>1. Go to <a href="https://developers.facebook.com" className="text-accent hover:underline" target="_blank">Facebook Developers</a></li>
                    <li>2. Create a new app and add Instagram Basic Display product</li>
                    <li>3. Add environment variables: VITE_INSTAGRAM_CLIENT_ID and VITE_INSTAGRAM_CLIENT_SECRET</li>
                    <li>4. Set redirect URI to: {window.location.origin}/auth/instagram/callback</li>
                  </ol>
                </div>

                {/* LinkedIn Setup */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    💼 LinkedIn API Setup
                  </h4>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>1. Go to <a href="https://developer.linkedin.com" className="text-accent hover:underline" target="_blank">LinkedIn Developer Portal</a></li>
                    <li>2. Create a new app and request access to Share on LinkedIn and Sign In with LinkedIn</li>
                    <li>3. Add environment variables: VITE_LINKEDIN_CLIENT_ID and VITE_LINKEDIN_CLIENT_SECRET</li>
                    <li>4. Set redirect URL to: {window.location.origin}/auth/linkedin/callback</li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 
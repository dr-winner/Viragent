import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Trash2, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { secureApiKeyService } from '../services/secureApiKeys';

const SecureApiKeyManager: React.FC = () => {
  const { identity } = useAuth();
  const [provider, setProvider] = useState<'openai' | 'github' | 'claude'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProviders, setUserProviders] = useState<string[]>([]);
  const [showKey, setShowKey] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addResult = (type: string, data: any) => {
    setResults(prev => [...prev, { type, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    loadUserProviders();
  }, []);

  const loadUserProviders = async () => {
    try {
      const providers = await secureApiKeyService.getUserApiProviders();
      setUserProviders(providers);
      addResult('User Providers', providers);
    } catch (error) {
      addResult('Error', error);
    }
  };

  const storeApiKey = async () => {
    if (!identity || !apiKey.trim()) {
      addResult('Error', 'Please connect your Internet Identity and enter an API key');
      return;
    }

    setLoading(true);
    try {
      const result = await secureApiKeyService.storeSecureApiKey(
        { provider, apiKey },
        identity.getPrincipal()
      );

      if (result.success) {
        addResult('Success', `Secure API key stored for ${provider}`);
        setApiKey('');
        await loadUserProviders();
      } else {
        addResult('Error', result.error);
      }
    } catch (error) {
      addResult('Error', error);
    }
    setLoading(false);
  };

  const retrieveApiKey = async (selectedProvider: string) => {
    if (!identity) {
      addResult('Error', 'Please connect your Internet Identity');
      return;
    }

    setLoading(true);
    try {
      const result = await secureApiKeyService.getSecureApiKey(
        selectedProvider,
        identity.getPrincipal()
      );

      if (result.success) {
        addResult('Retrieved Key', { provider: selectedProvider, key: result.data });
      } else {
        addResult('Error', result.error);
      }
    } catch (error) {
      addResult('Error', error);
    }
    setLoading(false);
  };

  const removeApiKey = async (selectedProvider: string) => {
    setLoading(true);
    try {
      const result = await secureApiKeyService.removeSecureApiKey(selectedProvider);
      
      if (result.success) {
        addResult('Success', `Removed secure API key for ${selectedProvider}`);
        await loadUserProviders();
      } else {
        addResult('Error', result.error);
      }
    } catch (error) {
      addResult('Error', error);
    }
    setLoading(false);
  };

  const getSystemStats = async () => {
    setLoading(true);
    try {
      const stats = await secureApiKeyService.getSecureConfigStats();
      addResult('System Stats', stats);
    } catch (error) {
      addResult('Error', error);
    }
    setLoading(false);
  };

  if (!identity) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Please connect your Internet Identity to manage secure API keys.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure API Key Management
          </CardTitle>
          <CardDescription>
            Store your API keys securely using vetKeys cryptographic protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              API keys are encrypted using Internet Computer's vetKeys technology before storage.
              They cannot be reverse engineered or accessed by unauthorized parties.
            </AlertDescription>
          </Alert>

          {/* Store New API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Store New API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="github">GitHub Models (FREE)</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button 
                onClick={storeApiKey} 
                disabled={loading || !apiKey.trim()}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Encrypt & Store API Key
              </Button>
            </CardContent>
          </Card>

          {/* Manage Existing Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Secure API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              {userProviders.length === 0 ? (
                <p className="text-gray-500">No secure API keys stored yet.</p>
              ) : (
                <div className="space-y-3">
                  {userProviders.map((providerName) => (
                    <div key={providerName} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{providerName.toUpperCase()}</span>
                        <span className="text-sm text-gray-500">• Encrypted</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retrieveApiKey(providerName)}
                          disabled={loading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeApiKey(providerName)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={getSystemStats} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Get Secure Configuration Stats
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.slice(-10).map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{result.type}</span>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecureApiKeyManager;

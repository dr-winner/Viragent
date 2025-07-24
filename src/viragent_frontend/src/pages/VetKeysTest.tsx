import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { ViragentCrypto } from '../services/vetkeys';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Principal } from '@dfinity/principal';

const VetKeysTest: React.FC = () => {
  const { service } = useBackend();
  const { identity } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [recipientPrincipal, setRecipientPrincipal] = useState('aaaaa-aa');

  const addResult = (type: string, data: any) => {
    setResults(prev => [...prev, { type, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testEncryptedContent = async () => {
    if (!service || !content || !identity) return;
    
    setLoading(true);
    try {
      // For now, let's test with simulated data since vetKeys requires complex setup
      const mockEncryptedData = new TextEncoder().encode(content);
      const mockIdentity = new TextEncoder().encode('test_identity');
      const mockSeed = new TextEncoder().encode('test_seed');
      
      // Store in backend using the service
      const result = await service.storeEncryptedContent(
        mockEncryptedData,
        mockIdentity,
        mockSeed,
        'text',
        undefined
      );
      
      if (result.success) {
        addResult('Encrypted Content', { contentId: result.data, original: content });
      } else {
        addResult('Error', (result as any).error);
      }
    } catch (error) {
      addResult('Error', error);
    }
    setLoading(false);
  };

  const testSecureMessage = async () => {
    if (!service || !message || !identity) return;
    
    setLoading(true);
    try {
      const mockEncryptedData = new TextEncoder().encode(message);
      const mockIdentity = new TextEncoder().encode('test_identity');
      const mockSeed = new TextEncoder().encode('test_seed');
      
      const result = await service.sendSecureMessage(
        Principal.fromText(recipientPrincipal),
        mockEncryptedData,
        mockIdentity,
        mockSeed
      );
      
      if (result.success) {
        addResult('Secure Message', { messageId: result.data, original: message });
      } else {
        addResult('Error', (result as any).error);
      }
    } catch (error) {
      addResult('Error', error);
    }
    setLoading(false);
  };

  const testPremiumContent = async () => {
    if (!service || !content || !identity) return;
    
    setLoading(true);
    try {
      const mockEncryptedData = new TextEncoder().encode(content);
      const mockAccessKey = new TextEncoder().encode('vip_access_key');
      
      const result = await service.createPremiumContent(
        mockEncryptedData,
        'VIP',
        mockAccessKey,
        100
      );
      
      if (result.success) {
        addResult('Premium Content', { contentId: result.data });
      } else {
        addResult('Error', (result as any).error);
      }
    } catch (error) {
      addResult('Error', error);
    }
    setLoading(false);
  };

  const getSystemStats = async () => {
    if (!service) return;
    
    setLoading(true);
    try {
      const result = await service.getVetKeysSystemStats();
      if (result.success) {
        addResult('System Stats', result.data);
      } else {
        addResult('Error', (result as any).error);
      }
    } catch (error) {
      addResult('Error', error);
    }
    setLoading(false);
  };

  if (!identity) {
    return <div>Please connect your Internet Identity to test vetKeys functionality.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>VetKeys Integration Test</CardTitle>
          <CardDescription>
            Test the cryptographic privacy features of Viragent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Current Principal: {identity?.getPrincipal().toString() || 'Not connected'}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Encrypted Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Encrypted Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="content">Content to Encrypt</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter content to encrypt..."
                  />
                </div>
                <Button 
                  onClick={testEncryptedContent} 
                  disabled={loading || !content}
                  className="w-full"
                >
                  Test Encrypted Storage
                </Button>
              </CardContent>
            </Card>

            {/* Secure Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Secure Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter secure message..."
                  />
                </div>
                <div>
                  <Label htmlFor="recipient">Recipient Principal</Label>
                  <Input
                    id="recipient"
                    value={recipientPrincipal}
                    onChange={(e) => setRecipientPrincipal(e.target.value)}
                    placeholder="Recipient principal ID"
                  />
                </div>
                <Button 
                  onClick={testSecureMessage} 
                  disabled={loading || !message}
                  className="w-full"
                >
                  Send Secure Message
                </Button>
              </CardContent>
            </Card>

            {/* Premium Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Premium Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testPremiumContent} 
                  disabled={loading || !content}
                  className="w-full"
                >
                  Create Premium Content
                </Button>
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
                  className="w-full"
                >
                  Get VetKeys Stats
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{result.type}</span>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <pre className="text-sm overflow-x-auto">
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

export default VetKeysTest;

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { backendService } from '@/services/backend';

const Debug = () => {
  const { isAuthenticated, identity, principal, login, isLoading, isBackendReady } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleTestButton = () => {
    addLog('Button clicked successfully!');
    alert('Button is working!');
  };

  const handleTestBackend = async () => {
    try {
      addLog('Testing backend connection...');
      if (!isBackendReady) {
        addLog('Backend not ready, initializing...');
        if (identity) {
          await backendService.init(identity);
          addLog('Backend initialized');
        } else {
          addLog('No identity available');
          return;
        }
      }
      
      const stats = await backendService.getSystemStats();
      if (stats.success) {
        addLog(`Backend test successful: ${JSON.stringify(stats.data)}`);
        setTestResult(JSON.stringify(stats.data, null, 2));
      } else {
        addLog(`Backend test failed: ${stats.error}`);
        setTestResult(`Error: ${stats.error}`);
      }
    } catch (error) {
      addLog(`Backend test error: ${error}`);
      setTestResult(`Error: ${error}`);
    }
  };

  const handleTestLogin = async () => {
    try {
      addLog('Testing login...');
      await login();
      addLog('Login successful');
    } catch (error) {
      addLog(`Login error: ${error}`);
    }
  };

  useEffect(() => {
    addLog('Debug page loaded');
    addLog(`Auth state: authenticated=${isAuthenticated}, loading=${isLoading}, backendReady=${isBackendReady}`);
    addLog(`Identity: ${identity ? 'present' : 'null'}`);
    addLog(`Principal: ${principal ? principal.toString() : 'null'}`);
  }, [isAuthenticated, isLoading, isBackendReady, identity, principal]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Frontend Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Button Tests</h2>
            <Button onClick={handleTestButton}>
              Test Basic Button
            </Button>
            <Button onClick={handleTestLogin} disabled={isLoading}>
              Test Login
            </Button>
            <Button onClick={handleTestBackend} disabled={!isAuthenticated}>
              Test Backend
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Auth Status</h2>
            <div className="p-4 bg-card rounded-lg">
              <p>Authenticated: {isAuthenticated ? '✅' : '❌'}</p>
              <p>Loading: {isLoading ? '⏳' : '✅'}</p>
              <p>Backend Ready: {isBackendReady ? '✅' : '❌'}</p>
              <p>Identity: {identity ? '✅' : '❌'}</p>
              <p>Principal: {principal ? principal.toString().slice(0, 20) + '...' : 'None'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Backend Test Result</h2>
          <pre className="p-4 bg-card rounded-lg text-sm overflow-auto">
            {testResult || 'No test run yet'}
          </pre>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
          <div className="p-4 bg-card rounded-lg max-h-96 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;

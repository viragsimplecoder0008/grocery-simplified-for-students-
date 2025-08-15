import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import apiService from '@/services/api';

const BackendTest = () => {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    data?: any;
  }>>([]);

  const addResult = (test: string, status: 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev, { test, status, message, data }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testHealthEndpoint = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      
      if (response.ok) {
        addResult('Health Check', 'success', 'Backend is running!', data);
      } else {
        addResult('Health Check', 'error', `HTTP ${response.status}`, data);
      }
    } catch (error) {
      addResult('Health Check', 'error', (error as Error).message);
    }
  };

  const testApiService = async () => {
    try {
      // This should fail with 401 since we don't have a token
      await apiService.getGroups();
      addResult('API Service', 'error', 'Expected authentication error but got success');
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('token') || errorMessage.includes('401')) {
        addResult('API Service', 'success', 'API service correctly requires authentication', errorMessage);
      } else {
        addResult('API Service', 'error', errorMessage);
      }
    }
  };

  const testCORS = async () => {
    try {
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:5173'
        }
      });
      
      if (response.ok) {
        addResult('CORS', 'success', 'CORS is working correctly');
      } else {
        addResult('CORS', 'error', `CORS test failed: ${response.status}`);
      }
    } catch (error) {
      addResult('CORS', 'error', (error as Error).message);
    }
  };

  const runAllTests = async () => {
    clearResults();
    await testHealthEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testCORS();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testApiService();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Backend Integration Test
          <Badge variant="outline">Development</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testHealthEndpoint} variant="outline">
            🔍 Test Health
          </Button>
          <Button onClick={testCORS} variant="outline">
            🌐 Test CORS
          </Button>
          <Button onClick={testApiService} variant="outline">
            🔐 Test API Service
          </Button>
          <Button onClick={runAllTests} className="bg-blue-600 hover:bg-blue-700">
            🚀 Run All Tests
          </Button>
          <Button onClick={clearResults} variant="ghost">
            🗑️ Clear
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.test}</span>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                {result.data && (
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Backend Status:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Backend should be running on: <code>http://localhost:3001</code></p>
            <p>• Health endpoint: <code>http://localhost:3001/health</code></p>
            <p>• API endpoints: <code>http://localhost:3001/api/*</code></p>
            <p>• Expected: Authentication required for protected endpoints</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackendTest;

import { supabase } from "@/integrations/supabase/client";
import { Database as DatabaseType } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Database, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DatabaseStatus {
  table: string;
  status: 'connected' | 'error' | 'missing';
  message: string;
}

export function DatabaseConnectionTester() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<DatabaseStatus[]>([]);
  const [overallStatus, setOverallStatus] = useState<'unknown' | 'connected' | 'partial' | 'error'>('unknown');

  const testDatabaseConnection = async () => {
    setTesting(true);
    const testResults: DatabaseStatus[] = [];
    
    try {
      // Test each critical table that exists in our types
      const tables: Array<keyof DatabaseType['public']['Tables']> = [
        'profiles',
        'products', 
        'categories',
        'grocery_lists',
        'groups',
        'group_memberships',
        'group_grocery_lists',
        'group_notifications'
      ];

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

          if (error) {
            if (error.message?.includes('relation') || 
                error.message?.includes('does not exist') ||
                error.code === 'PGRST106') {
              testResults.push({
                table,
                status: 'missing',
                message: `Table "${table}" does not exist in database`
              });
            } else {
              testResults.push({
                table,
                status: 'error',
                message: error.message || 'Unknown database error'
              });
            }
          } else {
            testResults.push({
              table,
              status: 'connected',
              message: `Connected successfully (${data?.length || 0} rows accessible)`
            });
          }
        } catch (err: any) {
          testResults.push({
            table,
            status: 'error',
            message: err.message || 'Connection failed'
          });
        }
      }

      // Determine overall status
      const connectedTables = testResults.filter(r => r.status === 'connected').length;
      const totalTables = testResults.length;
      
      if (connectedTables === totalTables) {
        setOverallStatus('connected');
        toast.success(`All ${totalTables} database tables are accessible!`);
      } else if (connectedTables > 0) {
        setOverallStatus('partial');
        toast.warning(`${connectedTables}/${totalTables} database tables accessible. Some features will use fallback mode.`);
      } else {
        setOverallStatus('error');
        toast.error('No database tables accessible. App is running in full fallback mode.');
      }

      setResults(testResults);

    } catch (error: any) {
      console.error('Database connection test failed:', error);
      toast.error('Failed to test database connection');
      setOverallStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const runMigrations = async () => {
    toast.info("Database migrations need to be run manually in Supabase dashboard", {
      description: "Check the supabase/migrations folder for SQL files to execute"
    });
  };

  const getStatusIcon = (status: DatabaseStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DatabaseStatus['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'missing':
        return <Badge className="bg-yellow-100 text-yellow-800">Missing</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'partial':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className={`${getOverallStatusColor()}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Status
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={testDatabaseConnection}
              disabled={testing}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button 
              onClick={runMigrations}
              variant="outline"
              size="sm"
            >
              Run Migrations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {overallStatus === 'unknown' ? (
            <p className="text-gray-600">Click "Test Connection" to check database status</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <strong>Overall Status:</strong>
                {overallStatus === 'connected' && (
                  <Badge className="bg-green-100 text-green-800">Fully Connected</Badge>
                )}
                {overallStatus === 'partial' && (
                  <Badge className="bg-yellow-100 text-yellow-800">Partial Connection (Fallback Mode)</Badge>
                )}
                {overallStatus === 'error' && (
                  <Badge className="bg-red-100 text-red-800">Full Fallback Mode</Badge>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Table Status:</h4>
                {results.map((result) => (
                  <div key={result.table} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <span className="font-mono text-sm">{result.table}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      <span className="text-xs text-gray-500 max-w-xs truncate" title={result.message}>
                        {result.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 mb-2">Why am I seeing "Fallback Mode"?</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Fallback Mode</strong> means your app is working offline-first using localStorage instead of the Supabase database.</p>
            <p>This usually happens when:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Database tables haven't been created yet (need migrations)</li>
              <li>Supabase project is paused or suspended</li>
              <li>Network connectivity issues</li>
              <li>Missing environment variables</li>
            </ul>
            <p className="mt-3">
              <strong>Solution:</strong> Run the database migrations in your Supabase dashboard or check the <code>supabase/migrations</code> folder.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

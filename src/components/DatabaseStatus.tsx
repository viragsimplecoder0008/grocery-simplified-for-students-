import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Check, X, AlertTriangle } from 'lucide-react';

interface TableStatus {
  name: string;
  exists: boolean;
  hasRls: boolean;
  error?: string;
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    tables: TableStatus[];
    checking: boolean;
    lastChecked?: Date;
  }>({
    connected: false,
    tables: [],
    checking: false
  });

  const tablesToCheck = [
    'profiles',
    'categories', 
    'brands',
    'products',
    'groups',
    'group_memberships',
    'split_bills'
  ];

  const checkDatabaseStatus = async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    
    try {
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });

      const connected = !connectionError;
      
      // Check individual tables
      const tableStatuses: TableStatus[] = [];
      
      for (const tableName of tablesToCheck) {
        try {
          // Use any to bypass TypeScript strict checking for dynamic table names
          const { error } = await (supabase as any)
            .from(tableName)
            .select('count', { count: 'exact', head: true });
          
          tableStatuses.push({
            name: tableName,
            exists: !error,
            hasRls: true, // Assume RLS is enabled if table exists
            error: error?.message
          });
        } catch (err: any) {
          tableStatuses.push({
            name: tableName,
            exists: false,
            hasRls: false,
            error: err.message
          });
        }
      }

      setStatus({
        connected,
        tables: tableStatuses,
        checking: false,
        lastChecked: new Date()
      });

    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        connected: false,
        checking: false,
        lastChecked: new Date()
      }));
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const getStatusIcon = (exists: boolean, error?: string) => {
    if (error?.includes('500')) return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    return exists ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (exists: boolean, error?: string) => {
    if (error?.includes('500')) return <Badge variant="destructive">500 Error</Badge>;
    return exists ? 
      <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge> : 
      <Badge variant="destructive">Missing</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Status
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkDatabaseStatus}
            disabled={status.checking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${status.checking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {status.connected ? 
              <Check className="w-4 h-4 text-green-500" /> : 
              <X className="w-4 h-4 text-red-500" />
            }
            <span className="font-medium">Database Connection</span>
          </div>
          {status.connected ? 
            <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge> :
            <Badge variant="destructive">Disconnected</Badge>
          }
        </div>

        {/* Table Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Tables Status:</h4>
          {status.tables.map((table) => (
            <div key={table.name} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(table.exists, table.error)}
                <span className="text-sm">{table.name}</span>
                {table.error && (
                  <span className="text-xs text-gray-500 truncate max-w-40" title={table.error}>
                    ({table.error})
                  </span>
                )}
              </div>
              {getStatusBadge(table.exists, table.error)}
            </div>
          ))}
        </div>

        {/* Last Checked */}
        {status.lastChecked && (
          <div className="text-xs text-gray-500 text-center">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </div>
        )}

        {/* Database Fix Instructions */}
        {status.tables.some(t => t.error?.includes('500')) && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <h5 className="font-medium text-orange-800 mb-2">Database Issues Detected</h5>
            <p className="text-sm text-orange-700 mb-2">
              500 errors suggest RLS policy issues. Run the database fix:
            </p>
            <code className="text-xs bg-orange-100 p-2 rounded block">
              database_rls_fix.sql
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

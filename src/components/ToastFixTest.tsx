import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ToastFixTest() {
  const testSuccessToast = () => {
    toast.success('Success! 🎉', {
      description: 'This is a success notification using Sonner',
      duration: 3000,
    });
  };

  const testErrorToast = () => {
    toast.error('Error! ❌', {
      description: 'This is an error notification using Sonner',
      duration: 3000,
    });
  };

  const testInfoToast = () => {
    toast.info('Information! ℹ️', {
      description: 'This is an info notification using Sonner',
      duration: 3000,
    });
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🧪 Toast System Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Test the unified Sonner toast system. The error you saw should be fixed now!
        </p>
        
        <div className="grid gap-2">
          <Button onClick={testSuccessToast} className="bg-green-600 hover:bg-green-700">
            Test Success Toast
          </Button>
          
          <Button onClick={testErrorToast} variant="destructive">
            Test Error Toast
          </Button>
          
          <Button onClick={testInfoToast} variant="outline">
            Test Info Toast
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p><strong>✅ Fixed:</strong> Removed conflicting toast systems</p>
          <p><strong>🎯 Using:</strong> Single Sonner toast system</p>
          <p><strong>🚀 Result:</strong> No more toast errors!</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ToastFixTest;

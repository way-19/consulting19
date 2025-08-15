import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Key, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { runAuthDiagnostic } from '../utils/authDiagnostic';

const DiagnosticPanel: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState({
    envVars: {
      supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      urlValue: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
      keyValue: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET'
    },
    connection: {
      status: 'testing',
      error: null as string | null
    },
    faqs: {
      count: 0,
      error: null as string | null,
      sampleData: [] as any[]
    }
  });

  const [testing, setTesting] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setTesting(true);
    
    try {
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('countries')
        .select('count')
        .limit(1);

      if (testError) {
        setDiagnostics(prev => ({
          ...prev,
          connection: { status: 'failed', error: testError.message }
        }));
        return;
      }

      setDiagnostics(prev => ({
        ...prev,
        connection: { status: 'success', error: null }
      }));

      // Test FAQs specifically
      const { data: faqData, error: faqError } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .limit(5);

      if (faqError) {
        setDiagnostics(prev => ({
          ...prev,
          faqs: { count: 0, error: faqError.message, sampleData: [] }
        }));
      } else {
        setDiagnostics(prev => ({
          ...prev,
          faqs: { count: faqData?.length || 0, error: null, sampleData: faqData || [] }
        }));
      }

    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        connection: { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
      }));
    } finally {
      setTesting(false);
    }
  };

  const runFullDiagnostic = async () => {
    console.log('🔍 Running full diagnostic...');
    await runAuthDiagnostic();
    await testConnection();
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Diagnostic</h3>
        <button
          onClick={runFullDiagnostic}
          disabled={testing}
          className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {testing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="space-y-4">
        {/* Environment Variables */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>Environment Variables</span>
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>SUPABASE_URL:</span>
              <div className="flex items-center space-x-1">
                {diagnostics.envVars.supabaseUrl ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-gray-600">{diagnostics.envVars.urlValue.slice(0, 30)}...</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>SUPABASE_ANON_KEY:</span>
              <div className="flex items-center space-x-1">
                {diagnostics.envVars.supabaseKey ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-gray-600">{diagnostics.envVars.keyValue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Database Connection</span>
          </h4>
          <div className="flex items-center space-x-2">
            {diagnostics.connection.status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : diagnostics.connection.status === 'failed' ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            )}
            <span className="text-sm">
              {diagnostics.connection.status === 'success' ? 'Connected' :
               diagnostics.connection.status === 'failed' ? 'Failed' : 'Testing...'}
            </span>
          </div>
          {diagnostics.connection.error && (
            <p className="text-xs text-red-600 mt-1">{diagnostics.connection.error}</p>
          )}
        </div>

        {/* FAQ Status */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>FAQ Data</span>
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>FAQ Count:</span>
              <span className={`font-medium ${diagnostics.faqs.count > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.faqs.count}
              </span>
            </div>
            {diagnostics.faqs.error && (
              <p className="text-xs text-red-600">{diagnostics.faqs.error}</p>
            )}
            {diagnostics.faqs.sampleData.length > 0 && (
              <div className="bg-green-50 rounded p-2">
                <p className="text-xs text-green-800">Sample FAQ found:</p>
                <p className="text-xs text-green-700 font-mono">
                  {diagnostics.faqs.sampleData[0]?.question?.slice(0, 50)}...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-red-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-red-700 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPanel;
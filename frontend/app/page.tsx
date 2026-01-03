"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import * as Tabs from '@radix-ui/react-tabs';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Logo from '@/components/Logo';

// Dynamically import the Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

type ActiveTab = 'compare' | 'indent' | 'syntax' | 'ai';

export default function CodeAnalyzer() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('compare');
  const [code1, setCode1] = useState('// Enter your first code here\nfunction example() {\n  console.log("Hello, world!");\n}');
  const [code2, setCode2] = useState('// Enter your second code here\nfunction example() {\n  console.log("Hello, updated world!");\n}');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to prepare code for JSON serialization
  const prepareCodeForRequest = (code: string): string => {
    // Replace any problematic characters and ensure proper line endings
    return code.replace(/\r\n|\r/g, '\n');
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;

      
      // Create a properly typed request data object
      const requestData: Record<string, string> = {};
      
      // Add fields based on the active tab
      if (activeTab === 'compare' || activeTab === 'ai') {
        requestData.old_code = prepareCodeForRequest(code1);
        requestData.new_code = prepareCodeForRequest(code2);
      } else {
        requestData.code = prepareCodeForRequest(code1);
      }
      
      console.log(`Making ${activeTab} request to:`, `${baseUrl}/${activeTab === 'ai' ? 'ai/summary' : activeTab}`);
      console.log('Request data:', JSON.stringify(requestData, null, 2));
      
      const commonConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000, // 10 second timeout
        transformRequest: [(data: unknown) => JSON.stringify(data)]
      };
      
      switch (activeTab) {
        case 'compare':
          response = await axios.post(
            `${baseUrl}/compare/`,  // Note the trailing slash
            {
              old_code: prepareCodeForRequest(code1),
              new_code: prepareCodeForRequest(code2)
            },
            commonConfig
          );
          break;
          
        case 'indent':
          response = await axios.post(
            `${baseUrl}/indent/`,  // Added trailing slash
            { code: prepareCodeForRequest(code1) },
            commonConfig
          );
          break;
          
        case 'syntax':
          response = await axios.post(
            `${baseUrl}/syntax/`,  // Added trailing slash
            { code: prepareCodeForRequest(code1) },
            commonConfig
          );
          break;
          
        case 'ai':
          response = await axios.post(
            `${baseUrl}/ai/summary/`,  // Added trailing slash
            { 
              old_code: prepareCodeForRequest(code1), 
              new_code: prepareCodeForRequest(code2) 
            },
            commonConfig
          );
          break;
      }
      
      setResult(response.data);
    } catch (err: any) {
      console.error('Full error object:', err);
      
      let errorMessage = 'An error occurred';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server Error: ${err.response.status} - ${err.response.statusText}`;
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = JSON.stringify(err.response.data);
          }
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Is the backend running?';
        console.error('Request was made but no response received:', err.request);
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else {
        // Something happened in setting up the request
        errorMessage = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
      console.error('Error details:', {
        config: err.config,
        request: err.request,
        response: err.response,
        message: err.message,
        stack: err.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Analyzing...';
    switch (activeTab) {
      case 'compare': return 'Compare Code';
      case 'indent': return 'Check Indentation';
      case 'syntax': return 'Validate Syntax';
      case 'ai': return 'Get AI Summary';
    }
  };

  // Function to render diff output in a clean format
  const renderDiffOutput = (diffData: any) => {
    if (!diffData) return null;

    if (diffData.diff && Array.isArray(diffData.diff)) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-auto max-h-96">
          <div className="font-mono text-sm">
            {diffData.diff.map((line: string, index: number) => {
              let lineClass = 'text-gray-800 dark:text-gray-200';
              if (line.startsWith('+')) {
                lineClass = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
              } else if (line.startsWith('-')) {
                lineClass = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
              } else if (line.startsWith('@@')) {
                lineClass = 'text-blue-600 dark:text-blue-400 font-medium';
              }

              return (
                <div key={index} className={`py-1 px-2 ${lineClass} whitespace-pre`}>
                  {line}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Additions</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">+{diffData.additions_count || 0}</div>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Deletions</div>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">-{diffData.deletions_count || 0}</div>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Changes</div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{diffData.total_changes || 0}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  
    
    // Fallback for non-diff results
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-auto max-h-96">
        <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
          {JSON.stringify(diffData, null, 2)}
        </pre>
      </div>
    );
  };

  // ✅ Paste AI Summary Renderer HERE
  const renderAISummary = (data: any) => {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-auto max-h-96">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>
            {data.summary || "No summary generated."}
          </ReactMarkdown>
        </div>

        {/* Diff Stats */}
        {data.diff_stats && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Additions</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  +{data.diff_stats.additions}
                </div>
              </div>

              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Deletions</div>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  -{data.diff_stats.deletions}
                </div>
              </div>

              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Changes</div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {data.diff_stats.total_changes}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* TOP HEADER: Logo + Settings */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.72l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.72l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.72V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
        
        <Tabs.Root
          defaultValue="compare"
          className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          onValueChange={(value) => setActiveTab(value as ActiveTab)}
        >
          <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700">
            <Tabs.Trigger
              value="compare"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              Compare Code
            </Tabs.Trigger>
            <Tabs.Trigger
              value="indent"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              Indentation Check
            </Tabs.Trigger>
            <Tabs.Trigger
              value="syntax"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              Syntax Validation
            </Tabs.Trigger>
            <Tabs.Trigger
              value="ai"
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              AI Summary
            </Tabs.Trigger>
          </Tabs.List>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="h-96">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {activeTab === 'compare' ? 'Original Code' : 'Enter Code'}
                </h3>
                <MonacoEditor
                  height="300px"
                  defaultLanguage="javascript"
                  theme="vs-light"
                  value={code1}
                  onChange={(value) => setCode1(value || '')}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </div>

              {activeTab === 'compare' || activeTab === 'ai' ? (
                <div className="h-96">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modified Code</h3>
                  <MonacoEditor
                    height="300px"
                    defaultLanguage="javascript"
                    theme="vs-light"
                    value={code2}
                    onChange={(value) => setCode2(value || '')}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div className="flex justify-center mb-6">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className={`px-6 py-2 rounded-md text-white font-medium ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
              >
                {getButtonText()}
              </button>
            </div>

            {error ? (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                  Error
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 overflow-auto">
                  <pre className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                    {error}
                  </pre>
                </div>
              </div>
            ) : result ? (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {activeTab === 'compare' ? 'Code Comparison Results' :
                   activeTab === 'indent' ? 'Indentation Analysis' :
                   activeTab === 'syntax' ? 'Syntax Validation' : 'AI Summary'}
                </h3>
                {activeTab === 'ai'
                  ? renderAISummary(result)
                  : renderDiffOutput(result)
                }
              </div>
            ) : null}
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}


"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import * as Tabs from '@radix-ui/react-tabs';
import axios from 'axios';

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
      const baseUrl = 'http://localhost:8000';
      
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Code Analysis Tool</h1>
        
        <Tabs.Root 
          defaultValue="compare" 
          className="bg-white rounded-lg shadow overflow-hidden"
          onValueChange={(value) => setActiveTab(value as ActiveTab)}
        >
          <Tabs.List className="flex border-b border-gray-200">
            <Tabs.Trigger 
              value="compare"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              Compare Code
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="indent"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              Indentation Check
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="syntax"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              Syntax Validation
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="ai"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              AI Summary
            </Tabs.Trigger>
          </Tabs.List>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="h-96">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
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
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Modified Code</h3>
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

            {(result || error) && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {error ? 'Error' : 'Result'}
                </h3>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto max-h-96">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {error ? error : JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}

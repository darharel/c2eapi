'use client';

import { useState } from 'react';

interface TestResult {
  status: number;
  statusText: string;
  data: any;
  headers: any;
  timestamp: string;
  duration: number;
}

export default function APITestPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('register');
  const [baseUrl, setBaseUrl] = useState('http://localhost:3001/api');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states for different endpoints
  const [username, setUsername] = useState('testuser');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');

  const endpoints = {
    register: {
      label: 'Register User',
      method: 'POST',
      path: '/auth/register',
      fields: ['username', 'email'],
      description: 'Register a new user and send verification email'
    },
    verify: {
      label: 'Verify Email',
      method: 'POST',
      path: '/auth/verify',
      fields: ['email', 'code'],
      description: 'Verify email with 6-digit code'
    },
    login: {
      label: 'Login (Request Code)',
      method: 'POST',
      path: '/auth/login',
      fields: ['email'],
      description: 'Request login code via email'
    },
    loginVerify: {
      label: 'Login (Verify Code)',
      method: 'POST',
      path: '/auth/verify',
      fields: ['email', 'code'],
      description: 'Login with verification code'
    },
    refresh: {
      label: 'Refresh Token',
      method: 'POST',
      path: '/auth/refresh',
      fields: ['token'],
      description: 'Refresh JWT token'
    },
    health: {
      label: 'Health Check',
      method: 'GET',
      path: '/health',
      fields: [],
      description: 'Check if API is running (note: /health not /api/health)'
    }
  };

  const executeTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();
    const endpoint = endpoints[selectedEndpoint as keyof typeof endpoints];

    try {
      // Build request body based on selected endpoint
      let body: any = {};

      if (endpoint.fields.includes('username')) body.username = username;
      if (endpoint.fields.includes('email')) body.email = email;
      if (endpoint.fields.includes('password')) body.password = password;
      if (endpoint.fields.includes('code')) body.code = code;
      if (endpoint.fields.includes('token')) body.token = token;

      // Build URL
      const url = endpoint.path === '/health'
        ? baseUrl.replace('/api', '') + endpoint.path
        : baseUrl + endpoint.path;

      // Make request
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (endpoint.method !== 'GET' && Object.keys(body).length > 0) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      const data = await response.json();

      setResult({
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString(),
        duration
      });

      // Auto-populate fields from response
      if (data.token && selectedEndpoint === 'verify') {
        setToken(data.token);
      }
      if (data.code && selectedEndpoint === 'register') {
        setCode(data.code);
      }

    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50 border-green-200';
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (status >= 500) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 API Testing Interface
          </h1>
          <p className="text-gray-600">
            Test Chess2Earn API endpoints with live requests and responses
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Request */}
          <div className="space-y-6">
            {/* Base URL Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configuration</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:3001/api"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Change this if testing remote server
                </p>
              </div>
            </div>

            {/* Endpoint Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📡 Endpoint</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Endpoint
                </label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(endpoints).map(([key, endpoint]) => (
                    <option key={key} value={key}>
                      {endpoint.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Endpoint Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-900">
                    {endpoints[selectedEndpoint as keyof typeof endpoints].method}
                  </span>
                  <code className="text-xs text-blue-700">
                    {endpoints[selectedEndpoint as keyof typeof endpoints].path}
                  </code>
                </div>
                <p className="text-xs text-blue-800">
                  {endpoints[selectedEndpoint as keyof typeof endpoints].description}
                </p>
              </div>

              {/* Dynamic Form Fields */}
              <div className="space-y-4">
                {endpoints[selectedEndpoint as keyof typeof endpoints].fields.includes('username') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {endpoints[selectedEndpoint as keyof typeof endpoints].fields.includes('email') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {endpoints[selectedEndpoint as keyof typeof endpoints].fields.includes('password') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {endpoints[selectedEndpoint as keyof typeof endpoints].fields.includes('code') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code (6 digits)
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123456"
                    />
                  </div>
                )}

                {endpoints[selectedEndpoint as keyof typeof endpoints].fields.includes('token') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JWT Token
                    </label>
                    <textarea
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                  </div>
                )}
              </div>

              {/* Execute Button */}
              <button
                onClick={executeTest}
                disabled={loading}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? '⏳ Testing...' : '🚀 Execute Test'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setEmail('cryptodaj@gmail.com');
                    setUsername('hikaru');
                    setPassword('password123');
                  }}
                  className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm font-medium"
                >
                  Use Test Account (hikaru)
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                    setCode('');
                    setToken('');
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                >
                  Clear Results
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Response */}
          <div className="space-y-6">
            {/* Status */}
            {result && (
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">
                    {result.status >= 200 && result.status < 300 ? '✅' : '❌'} Response Status
                  </h2>
                  <span className="text-sm font-mono">
                    {result.duration}ms
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold">{result.status}</span>
                  <span className="text-lg">{result.statusText}</span>
                </div>
                <p className="text-xs mt-2">{result.timestamp}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-2">❌ Error</h2>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 font-mono text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Response Data */}
            {result && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">📦 Response Data</h2>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(result.data, null, 2))}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                  <pre className="text-green-400 font-mono text-xs">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Response Headers */}
            {result && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Response Headers</h2>
                <div className="space-y-2">
                  {Object.entries(result.headers).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs border-b border-gray-100 pb-2">
                      <span className="font-semibold text-gray-700">{key}:</span>
                      <span className="text-gray-600 font-mono">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testing Tips */}
            {!result && !error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Testing Tips</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <strong>1. Register:</strong> Creates a new user and sends verification email
                  </p>
                  <p>
                    <strong>2. Check Email:</strong> Look for 6-digit code in your inbox
                  </p>
                  <p>
                    <strong>3. Verify:</strong> Use the code to verify your email
                  </p>
                  <p>
                    <strong>4. Login:</strong> Request login code, then verify to get JWT token
                  </p>
                  <p className="pt-3 border-t border-gray-200">
                    <strong>Test Account:</strong> hikaru / cryptodaj@gmail.com / password123
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

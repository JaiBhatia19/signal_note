'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { isDemoMode } from '@/lib/env';

export default function WebhookTab() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    // Generate demo webhook URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://signalnote.vercel.app';
    setWebhookUrl(`${baseUrl}/api/ingest/webhook`);
    
    // Generate or retrieve auth token (in demo mode, use a fixed token)
    const token = isDemoMode() ? 'demo_token_123456' : generateAuthToken();
    setAuthToken(token);
  }, []);

  const generateAuthToken = () => {
    return 'sk_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const testWebhook = async () => {
    try {
      const testPayload = {
        text: "This is a test webhook message from SignalNote setup",
        source: "webhook_test",
        user_segment: "test",
        product_area: "webhook"
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        alert('Webhook test successful! Check your insights for the test message.');
      } else {
        alert('Webhook test failed. Please check your configuration.');
      }
    } catch (error) {
      alert('Webhook test failed. Please check your configuration.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Webhook Integration</h3>
        <p className="text-gray-600">
          Send feedback directly to SignalNote via webhook. Perfect for integrations with Zapier, n8n, or custom applications.
        </p>
      </div>

      {/* Webhook Configuration */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">🔗 Webhook Configuration</h4>
        
        <div className="space-y-4">
          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                data-testid="webhook-url-input"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl, 'url')}
                data-testid="copy-webhook-url"
              >
                {copied === 'url' ? '✓' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Auth Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authorization Token
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="password"
                value={authToken}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                data-testid="auth-token-input"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(authToken, 'token')}
                data-testid="copy-auth-token"
              >
                {copied === 'token' ? '✓' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Include this token in the Authorization header as "Bearer {authToken}"
            </p>
          </div>
        </div>
      </div>

      {/* Request Format */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">📋 Request Format</h4>
        <div className="text-sm">
          <p className="text-blue-800 mb-2">Send a POST request with this JSON structure:</p>
          <pre className="bg-blue-100 p-3 rounded text-blue-900 overflow-x-auto text-xs">
{`{
  "text": "Customer feedback content here",
  "source": "typeform",          // optional
  "user_segment": "enterprise",  // optional  
  "product_area": "dashboard",   // optional
  "created_at": "2024-01-15"     // optional
}`}
          </pre>
        </div>
      </div>

      {/* Headers Example */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-3">🔐 Required Headers</h4>
        <pre className="bg-green-100 p-3 rounded text-green-900 overflow-x-auto text-xs">
{`Content-Type: application/json
Authorization: Bearer ${authToken}`}
        </pre>
      </div>

      {/* Test Webhook */}
      <div className="text-center">
        <Button
          onClick={testWebhook}
          data-testid="test-webhook-button"
          className="w-full md:w-auto"
        >
          🧪 Test Webhook
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          This will send a test message to verify your webhook is working
        </p>
      </div>

      {/* Integration Examples */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">🔗 Integration Examples</h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Zapier */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Zapier</h5>
            <p className="text-sm text-gray-600 mb-3">
              Connect Typeform, Google Forms, or any app to automatically send feedback to SignalNote.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>1. Create a new Zap</li>
              <li>2. Choose your trigger app</li>
              <li>3. Add "Webhooks by Zapier" action</li>
              <li>4. Use the URL and headers above</li>
            </ul>
          </div>

          {/* curl Example */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">curl Example</h5>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${authToken}" \\
  -d '{"text":"Great product!"}'`}
            </pre>
          </div>

          {/* Typeform */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Typeform</h5>
            <p className="text-sm text-gray-600 mb-3">
              Send Typeform responses directly to SignalNote for instant analysis.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>1. Go to Typeform Connect</li>
              <li>2. Add Webhook endpoint</li>
              <li>3. Use URL above</li>
              <li>4. Map response fields to JSON</li>
            </ul>
          </div>

          {/* Google Forms */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Google Forms</h5>
            <p className="text-sm text-gray-600 mb-3">
              Use Google Apps Script to send form responses to SignalNote.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>1. Open Form → More → Script editor</li>
              <li>2. Add onFormSubmit trigger</li>
              <li>3. Make HTTP POST request</li>
              <li>4. Deploy as web app</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">🔒 Security Note</h4>
        <p className="text-sm text-yellow-800">
          Keep your authorization token secure. If compromised, contact support to regenerate it. 
          All webhook requests are logged for security monitoring.
        </p>
      </div>
    </div>
  );
}

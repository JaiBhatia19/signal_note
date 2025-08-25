'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '@/components/Button';
import Textarea from '@/components/Textarea';
import { isDemoMode } from '@/lib/env';

export default function EmailDrop() {
  const [emailText, setEmailText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      // In demo mode, simulate upload success
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResult({
          success: true,
          message: 'Demo: Email file processed successfully!',
          processed: 5,
          analyzed: 5
        });
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ingest/email', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await response.json();
      setResult(uploadResult);
    } catch (error) {
      setResult({
        success: false,
        message: 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  }, []);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText.trim()) return;

    setProcessing(true);
    setResult(null);

    try {
      // In demo mode, simulate processing success
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResult({
          success: true,
          message: 'Demo: Email text processed successfully!',
          processed: 1,
          analyzed: 1
        });
        setEmailText('');
        setProcessing(false);
        return;
      }

      const response = await fetch('/api/ingest/email-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: emailText }),
      });

      const textResult = await response.json();
      setResult(textResult);
      
      if (textResult.success) {
        setEmailText('');
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Processing failed. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'message/rfc822': ['.eml'],
      'text/plain': ['.txt'],
      'application/octet-stream': ['.msg']
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Content Analysis</h3>
        <p className="text-gray-600">
          Upload email files (.eml, .msg) or paste email content to extract customer feedback from support conversations.
        </p>
      </div>

      {/* File Upload Section */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">📧 Upload Email Files</h4>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          data-testid="email-dropzone"
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <div className="text-3xl">📧</div>
            {uploading ? (
              <div>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Processing email...</p>
              </div>
            ) : isDragActive ? (
              <p className="text-sm font-medium text-blue-600">Drop your email file here</p>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-900">Drag & drop email files here</p>
                <p className="text-xs text-gray-600">or click to browse</p>
                <p className="text-xs text-gray-500">Supports .eml, .msg, .txt files</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Input Section */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-gray-900 mb-3">✍️ Paste Email Content</h4>
        
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-text" className="block text-sm font-medium text-gray-700 mb-2">
              Email Content
            </label>
            <Textarea
              id="email-text"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste your email content here... Include headers, body, and any relevant conversation threads."
              rows={8}
              maxLength={10000}
              data-testid="email-text-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              {emailText.length}/10,000 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={!emailText.trim() || processing}
            data-testid="process-email-text-button"
          >
            {processing ? 'Processing...' : 'Process Email Content'}
          </Button>
        </form>
      </div>

      {/* What We Extract */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">🔍 What We Extract</h4>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Customer feedback and feature requests</li>
          <li>Bug reports and issue descriptions</li>
          <li>Sentiment from support conversations</li>
          <li>Product-specific feedback mentions</li>
          <li>Urgency indicators and priority signals</li>
        </ul>
      </div>

      {/* Processing Result */}
      {result && (
        <div className={`rounded-lg p-4 ${
          result.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? '✅' : '❌'}
            </span>
            <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
              {result.message}
            </p>
          </div>
          
          {result.success && result.processed && (
            <div className="text-sm text-green-800">
              <p>Processed {result.processed} email(s)</p>
              <p>Extracted {result.analyzed} feedback items</p>
              <div className="mt-3">
                <a href="/insights" data-testid="view-insights-email">
                  <Button size="sm">
                    View Insights →
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Types */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📝 Supported Email Types</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-1">File Formats</h5>
            <ul className="space-y-1 text-xs">
              <li>• .eml (Outlook, Thunderbird)</li>
              <li>• .msg (Outlook)</li>
              <li>• .txt (Plain text emails)</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-1">Content Types</h5>
            <ul className="space-y-1 text-xs">
              <li>• Support conversations</li>
              <li>• Customer feedback emails</li>
              <li>• Feature request threads</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Tips for Better Analysis</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Include complete email threads for context</li>
          <li>• Preserve email headers when possible</li>
          <li>• Multiple related emails can be uploaded separately</li>
          <li>• Remove sensitive personal information before processing</li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">🔒 Privacy & Security</h4>
        <p className="text-sm text-yellow-800">
          Email content is processed to extract feedback only. Personal identifiers like email addresses 
          and names are automatically redacted. Original email files are not permanently stored.
        </p>
      </div>
    </div>
  );
}

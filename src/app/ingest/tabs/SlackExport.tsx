'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '@/components/Button';
import { isDemoMode } from '@/lib/env';

export default function SlackExport() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // In demo mode, simulate upload success
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 2500));
        setUploadResult({
          success: true,
          message: 'Demo: Slack export processed successfully!',
          processed: 18,
          analyzed: 18
        });
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ingest/slack', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Slack Export Upload</h3>
        <p className="text-gray-600">
          Upload Slack channel exports to analyze team feedback and conversations. Supports JSON export format.
        </p>
      </div>

      {/* Export Instructions */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-3">📋 How to Export from Slack</h4>
        <ol className="text-sm text-purple-800 space-y-2 list-decimal list-inside">
          <li>Go to your Slack workspace settings</li>
          <li>Navigate to "Import/Export Data"</li>
          <li>Choose "Export" and select date range</li>
          <li>Download the ZIP file and extract the JSON files</li>
          <li>Upload the channel JSON file you want to analyze</li>
        </ol>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        data-testid="slack-dropzone"
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl">💬</div>
          {uploading ? (
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-lg font-medium text-gray-900">Processing Slack messages...</p>
              <p className="text-sm text-gray-600">Extracting feedback from conversations</p>
            </div>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-purple-600">Drop your Slack JSON file here</p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900">Drag & drop Slack JSON export here</p>
              <p className="text-sm text-gray-600">or click to browse files</p>
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 50MB</p>
            </div>
          )}
        </div>
      </div>

      {/* What We Extract */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">🔍 What We Extract</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Messages that contain feedback keywords</li>
          <li>User reactions and thread discussions</li>
          <li>Feature requests and bug reports</li>
          <li>Customer sentiment from conversations</li>
          <li>Team discussions about user feedback</li>
        </ul>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className={`rounded-lg p-4 ${
          uploadResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-lg ${uploadResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {uploadResult.success ? '✅' : '❌'}
            </span>
            <p className={`font-medium ${uploadResult.success ? 'text-green-900' : 'text-red-900'}`}>
              {uploadResult.message}
            </p>
          </div>
          
          {uploadResult.success && uploadResult.processed && (
            <div className="text-sm text-green-800">
              <p>Processed {uploadResult.processed} relevant messages</p>
              <p>Analyzed {uploadResult.analyzed} feedback items</p>
              <div className="mt-3">
                <a href="/insights" data-testid="view-insights-slack">
                  <Button size="sm">
                    View Insights →
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Supported Formats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">📄 Supported Formats</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h5 className="font-medium mb-1">Slack Export JSON</h5>
            <ul className="space-y-1 text-xs">
              <li>• Channel export files</li>
              <li>• Direct message exports</li>
              <li>• Thread conversations</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-1">Message Types</h5>
            <ul className="space-y-1 text-xs">
              <li>• User messages</li>
              <li>• Bot responses</li>
              <li>• File shares with comments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">🔒 Privacy & Security</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Only feedback-related messages are extracted and stored</li>
          <li>• Personal identifiers are automatically redacted</li>
          <li>• Original files are not stored permanently</li>
          <li>• All data processing complies with privacy regulations</li>
        </ul>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Tips for Better Results</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Use channels where customers share feedback (e.g., #feedback, #support)</li>
          <li>• Include channels with team discussions about user requests</li>
          <li>• Export recent data for the most relevant insights</li>
          <li>• Consider multiple channels for comprehensive analysis</li>
        </ul>
      </div>
    </div>
  );
}

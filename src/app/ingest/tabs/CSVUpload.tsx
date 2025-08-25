'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '@/components/Button';
import { isDemoMode } from '@/lib/env';

export default function CSVUpload() {
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        setUploadResult({
          success: true,
          message: 'Demo: CSV processed successfully!',
          processed: 15,
          analyzed: 15
        });
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ingest/csv', {
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
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV File</h3>
        <p className="text-gray-600">
          Upload a CSV file with customer feedback. Supports Excel (.xlsx), CSV (.csv) formats.
        </p>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        data-testid="csv-dropzone"
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl">📊</div>
          {uploading ? (
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-lg font-medium text-gray-900">Processing your file...</p>
              <p className="text-sm text-gray-600">This may take a few moments</p>
            </div>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-blue-600">Drop your CSV file here</p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900">Drag & drop your CSV file here</p>
              <p className="text-sm text-gray-600">or click to browse files</p>
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* CSV Format Requirements */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Required CSV Format</h4>
        <div className="text-sm text-yellow-800">
          <p className="mb-2">Your CSV must include these columns:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><code className="bg-yellow-100 px-1 rounded">text</code> - The feedback content (required)</li>
            <li><code className="bg-yellow-100 px-1 rounded">source</code> - Where feedback came from (optional)</li>
            <li><code className="bg-yellow-100 px-1 rounded">user_segment</code> - Customer type (optional)</li>
            <li><code className="bg-yellow-100 px-1 rounded">product_area</code> - Product feature (optional)</li>
            <li><code className="bg-yellow-100 px-1 rounded">created_at</code> - Date received (optional)</li>
          </ul>
        </div>
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
              <p>Processed {uploadResult.processed} feedback items</p>
              <p>Analyzed {uploadResult.analyzed} items with AI</p>
              <div className="mt-3">
                <a href="/insights" data-testid="view-insights-button">
                  <Button size="sm">
                    View Insights →
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample CSV Download */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">
          Not sure about the format? Download our sample CSV to get started.
        </p>
        <a 
          href="/samples/sample-feedback.csv" 
          download 
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          data-testid="download-sample-csv-button"
        >
          📥 Download Sample CSV
        </a>
      </div>
    </div>
  );
}

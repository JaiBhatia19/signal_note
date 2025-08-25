'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { isDemoMode } from '@/lib/env';

export default function GoogleSheets() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.trim()) return;

    setImporting(true);
    setImportResult(null);

    try {
      // In demo mode, simulate import success
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setImportResult({
          success: true,
          message: 'Demo: Google Sheets imported successfully!',
          processed: 23,
          analyzed: 23
        });
        setImporting(false);
        return;
      }

      const response = await fetch('/api/ingest/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: sheetUrl }),
      });

      const result = await response.json();
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Import failed. Please check the URL and try again.',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import from Google Sheets</h3>
        <p className="text-gray-600">
          Import feedback directly from a public Google Sheets document. Perfect for collaborative feedback collection.
        </p>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">📋 Setup Instructions</h4>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Open your Google Sheets document</li>
          <li>Click "Share" → "Change to anyone with the link"</li>
          <li>Set permission to "Viewer" and copy the link</li>
          <li>Paste the link below and click Import</li>
        </ol>
      </div>

      <form onSubmit={handleImport} className="space-y-4">
        <div>
          <label htmlFor="sheet-url" className="block text-sm font-medium text-gray-700 mb-2">
            Google Sheets URL
          </label>
          <Input
            id="sheet-url"
            type="url"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit..."
            required
            data-testid="sheets-url-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            The sheet must be publicly accessible with "Anyone with the link" permission
          </p>
        </div>

        <Button
          type="submit"
          disabled={!sheetUrl.trim() || importing}
          className="w-full"
          data-testid="import-sheets-button"
        >
          {importing ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Importing...</span>
            </span>
          ) : (
            'Import from Google Sheets'
          )}
        </Button>
      </form>

      {/* Column Requirements */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Required Columns</h4>
        <div className="text-sm text-yellow-800">
          <p className="mb-2">Your Google Sheet should have these columns (same as CSV format):</p>
          <ul className="list-disc list-inside space-y-1">
            <li><code className="bg-yellow-100 px-1 rounded">text</code> - The feedback content (required)</li>
            <li><code className="bg-yellow-100 px-1 rounded">source</code> - Where feedback came from (optional)</li>
            <li><code className="bg-yellow-100 px-1 rounded">user_segment</code> - Customer type (optional)</li>
            <li><code className="bg-yellow-100 px-1 rounded">product_area</code> - Product feature (optional)</li>
            <li><code className="bg-yellow-100 px-1 rounded">created_at</code> - Date received (optional)</li>
          </ul>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className={`rounded-lg p-4 ${
          importResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-lg ${importResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {importResult.success ? '✅' : '❌'}
            </span>
            <p className={`font-medium ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
              {importResult.message}
            </p>
          </div>
          
          {importResult.success && importResult.processed && (
            <div className="text-sm text-green-800">
              <p>Processed {importResult.processed} feedback items</p>
              <p>Analyzed {importResult.analyzed} items with AI</p>
              <div className="mt-3">
                <a href="/insights" data-testid="view-insights-sheets">
                  <Button size="sm">
                    View Insights →
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Use Google Forms to collect feedback directly into a Sheet</li>
          <li>• Set up automatic imports by sharing the same Sheet URL</li>
          <li>• Keep the first row as headers (column names)</li>
          <li>• Data is imported from the first worksheet/tab only</li>
        </ul>
      </div>

      {/* Sample Sheet Template */}
      <div className="text-center border-t pt-4">
        <p className="text-sm text-gray-600 mb-3">
          Need a template? Create a copy of our sample Google Sheet.
        </p>
        <a 
          href="https://docs.google.com/spreadsheets/d/1example/template" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          data-testid="sample-sheets-template"
        >
          📄 Use Sample Template
        </a>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';

export default function IngestPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Manual feedback form
  const [feedbackData, setFeedbackData] = useState({
    text: '',
    source: '',
    user_segment: '',
    product_area: '',
  });

  // CSV upload
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
      setFeedbackData({ text: '', source: '', user_segment: '', product_area: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch('/api/feedback/batch', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload CSV');
      }

      setIsSubmitted(true);
      setCsvFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Feedback Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted and is being analyzed by our AI.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button className="w-full">
                View Dashboard
              </Button>
            </Link>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Add More Feedback
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Add Customer Feedback
          </h1>
          <p className="text-xl text-gray-600">
            Collect and analyze customer feedback to uncover insights and improve your product.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'csv'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              CSV Upload
            </button>
          </div>
        </div>

        {activeTab === 'manual' ? (
          /* Manual Feedback Form */
          <Card className="max-w-2xl mx-auto">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Text *
                </label>
                <Textarea
                  id="text"
                  value={feedbackData.text}
                  onChange={(e) => setFeedbackData({ ...feedbackData, text: e.target.value })}
                  placeholder="Paste or type your customer feedback here..."
                  required
                  rows={6}
                  className="w-full"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                    Source
                  </label>
                  <Input
                    id="source"
                    value={feedbackData.source}
                    onChange={(e) => setFeedbackData({ ...feedbackData, source: e.target.value })}
                    placeholder="Email, Survey, Support..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="user_segment" className="block text-sm font-medium text-gray-700 mb-2">
                    User Segment
                  </label>
                  <Input
                    id="user_segment"
                    value={feedbackData.user_segment}
                    onChange={(e) => setFeedbackData({ ...feedbackData, user_segment: e.target.value })}
                    placeholder="Enterprise, SMB, Freemium..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="product_area" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Area
                  </label>
                  <Input
                    id="product_area"
                    value={feedbackData.product_area}
                    onChange={(e) => setFeedbackData({ ...feedbackData, product_area: e.target.value })}
                    placeholder="UI, API, Mobile..."
                    className="w-full"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !feedbackData.text.trim()}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </Card>
        ) : (
          /* CSV Upload Form */
          <Card className="max-w-2xl mx-auto">
            <form onSubmit={handleCSVUpload} className="space-y-6">
              <div>
                <label htmlFor="csv" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="csv"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="csv" className="cursor-pointer">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      {csvFile ? csvFile.name : 'Click to select CSV file'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports .csv files up to 5MB
                    </p>
                  </label>
                </div>
              </div>

              {/* CSV Format Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Format</h3>
                <p className="text-sm text-blue-800 mb-2">
                  Your CSV should have these columns (only 'text' is required):
                </p>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>text</strong> - The feedback content (required)</div>
                  <div><strong>source</strong> - Where the feedback came from</div>
                  <div><strong>user_segment</strong> - User type or segment</div>
                  <div><strong>product_area</strong> - Product feature or area</div>
                  <div><strong>created_at</strong> - When feedback was received (YYYY-MM-DD)</div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isUploading || !csvFile}
                className="w-full"
              >
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </Button>
            </form>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Manual Entry</h4>
                  <p>Perfect for individual feedback items, interview notes, or quick insights.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">CSV Upload</h4>
                  <p>Great for bulk imports from surveys, support tickets, or existing feedback systems.</p>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/dashboard">
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 
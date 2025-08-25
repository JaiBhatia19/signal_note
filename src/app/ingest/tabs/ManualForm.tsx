'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import { isDemoMode } from '@/lib/env';

export default function ManualForm() {
  const [formData, setFormData] = useState({
    text: '',
    source: '',
    user_segment: '',
    product_area: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return;

    setSubmitting(true);
    setSubmitResult(null);

    try {
      // In demo mode, simulate success
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubmitResult({
          success: true,
          message: 'Demo: Feedback submitted successfully!',
        });
        setFormData({ text: '', source: '', user_segment: '', product_area: '' });
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/ingest/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setSubmitResult(result);
      
      if (result.success) {
        setFormData({ text: '', source: '', user_segment: '', product_area: '' });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Submission failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Feedback Manually</h3>
        <p className="text-gray-600">
          Enter customer feedback directly into the form. Perfect for one-off feedback or testing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feedback Text */}
        <div>
          <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700 mb-2">
            Feedback Text <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="feedback-text"
            value={formData.text}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder="Enter the customer feedback here..."
            rows={4}
            required
            maxLength={1000}
            data-testid="feedback-text-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.text.length}/1000 characters
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Source */}
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <select
              id="source"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="source-select"
            >
              <option value="">Select source...</option>
              <option value="email">Email</option>
              <option value="support">Support Ticket</option>
              <option value="in-app">In-App Feedback</option>
              <option value="chat">Live Chat</option>
              <option value="phone">Phone Call</option>
              <option value="survey">Survey</option>
              <option value="social_media">Social Media</option>
              <option value="app_store">App Store Review</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* User Segment */}
          <div>
            <label htmlFor="user_segment" className="block text-sm font-medium text-gray-700 mb-2">
              User Segment
            </label>
            <select
              id="user_segment"
              value={formData.user_segment}
              onChange={(e) => handleChange('user_segment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="user-segment-select"
            >
              <option value="">Select segment...</option>
              <option value="free">Free User</option>
              <option value="pro">Pro User</option>
              <option value="enterprise">Enterprise</option>
              <option value="startup">Startup</option>
              <option value="trial">Trial User</option>
              <option value="churned">Churned User</option>
            </select>
          </div>
        </div>

        {/* Product Area */}
        <div>
          <label htmlFor="product_area" className="block text-sm font-medium text-gray-700 mb-2">
            Product Area
          </label>
          <select
            id="product_area"
            value={formData.product_area}
            onChange={(e) => handleChange('product_area', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="product-area-select"
          >
            <option value="">Select product area...</option>
            <option value="dashboard">Dashboard</option>
            <option value="search">Search</option>
            <option value="mobile">Mobile App</option>
            <option value="api">API</option>
            <option value="integrations">Integrations</option>
            <option value="reporting">Reporting</option>
            <option value="ui">User Interface</option>
            <option value="performance">Performance</option>
            <option value="security">Security</option>
            <option value="billing">Billing</option>
            <option value="support">Support</option>
            <option value="onboarding">Onboarding</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            disabled={!formData.text.trim() || submitting}
            className="w-full"
            data-testid="submit-feedback-button"
          >
            {submitting ? 'Analyzing...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>

      {/* Submit Result */}
      {submitResult && (
        <div className={`rounded-lg p-4 ${
          submitResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`text-lg ${submitResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {submitResult.success ? '✅' : '❌'}
            </span>
            <p className={`font-medium ${submitResult.success ? 'text-green-900' : 'text-red-900'}`}>
              {submitResult.message}
            </p>
          </div>
          
          {submitResult.success && (
            <div className="mt-3">
              <a href="/insights" data-testid="view-insights-after-submit">
                <Button size="sm">
                  View Analysis →
                </Button>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Better Analysis</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include specific details about the user's experience</li>
          <li>• Mention specific features or product areas when possible</li>
          <li>• Add context about the user's situation or use case</li>
          <li>• Select the most accurate source and user segment for better insights</li>
        </ul>
      </div>
    </div>
  );
}

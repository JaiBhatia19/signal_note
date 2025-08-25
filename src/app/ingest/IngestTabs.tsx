'use client';

import { useState } from 'react';
import CSVUpload from './tabs/CSVUpload';
import ManualForm from './tabs/ManualForm';
import GoogleSheets from './tabs/GoogleSheets';
import WebhookTab from './tabs/WebhookTab';
import SlackExport from './tabs/SlackExport';
import EmailDrop from './tabs/EmailDrop';

const tabs = [
  { id: 'csv', name: 'CSV Upload', icon: '📊' },
  { id: 'manual', name: 'Manual Entry', icon: '✍️' },
  { id: 'sheets', name: 'Google Sheets', icon: '📄' },
  { id: 'webhook', name: 'Webhook API', icon: '🔗' },
  { id: 'slack', name: 'Slack Export', icon: '💬' },
  { id: 'email', name: 'Email Drop', icon: '📧' },
];

export default function IngestTabs() {
  const [activeTab, setActiveTab] = useState('csv');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'csv':
        return <CSVUpload />;
      case 'manual':
        return <ManualForm />;
      case 'sheets':
        return <GoogleSheets />;
      case 'webhook':
        return <WebhookTab />;
      case 'slack':
        return <SlackExport />;
      case 'email':
        return <EmailDrop />;
      default:
        return <CSVUpload />;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
}

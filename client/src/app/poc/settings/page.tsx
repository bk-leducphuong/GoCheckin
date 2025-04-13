"use client";

import { useState } from 'react';
import SessionManager from '@/components/auth/SessionManager';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('sessions');

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="mt-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-4 px-1 ${
              activeTab === 'sessions'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Session Management
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 px-1 ${
              activeTab === 'security'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-4 px-1 ${
              activeTab === 'notifications'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'sessions' && (
          <div>
            <p className="text-gray-600 mb-6">
              Manage your active sessions across all devices. You can revoke access to any session or all sessions at once.
            </p>
            <SessionManager />
          </div>
        )}
        
        {activeTab === 'security' && (
          <div>
            <p className="text-gray-600 mb-6">
              Security settings will be implemented in the future.
            </p>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <p className="text-gray-600 mb-6">
              Notification preferences will be implemented in the future.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
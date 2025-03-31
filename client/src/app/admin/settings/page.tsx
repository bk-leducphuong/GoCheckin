'use client';

import { useState } from 'react';
import SessionManager from '@/components/auth/SessionManager';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('sessions');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="mb-6 border-b border-gray-200">
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
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
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
        
        {activeTab === 'profile' && (
          <div>
            <p className="text-gray-600 mb-6">
              Profile settings will be implemented in the future.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
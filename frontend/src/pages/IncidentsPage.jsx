import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IncidentsList from '../components/incidents/IncidentsList';
import AutoDetectionPanel from '../components/incidents/AutoDetectionPanel';

const IncidentsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('incidents');

  const handleIncidentClick = (incident) => {
    navigate(`/incidents/${incident._id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor, detect, and resolve service incidents with AI-powered analysis
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'incidents', name: 'Incidents', icon: '🚨' },
                { id: 'auto-detection', name: 'Auto-Detection', icon: '🤖' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'incidents' && (
            <IncidentsList onIncidentClick={handleIncidentClick} />
          )}
          
          {activeTab === 'auto-detection' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">AI-Powered Auto-Detection</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Use artificial intelligence to automatically detect potential incidents based on service patterns, 
                        response times, and error rates. Configure your detection settings below and let AI monitor your 
                        services 24/7.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <AutoDetectionPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentsPage;

import React, { useState, useEffect } from 'react';
import { getServices, autoDetectIncidents } from '../../utils/api';
import toast from 'react-hot-toast';

const AutoDetectionPanel = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    thresholdMinutes: 5,
    selectedServices: []
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSettings(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleSelectAll = () => {
    setSettings(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.length === services.length 
        ? [] 
        : services.map(s => s._id)
    }));
  };

  const handleAutoDetect = async () => {
    if (settings.selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    setLoading(true);
    try {
      const detectionPromises = settings.selectedServices.map(serviceId =>
        autoDetectIncidents(serviceId, settings.thresholdMinutes)
      );

      const results = await Promise.allSettled(detectionPromises);
      
      let successCount = 0;
      let errorCount = 0;
      const detectedIncidents = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          if (result.value.data.incident) {
            detectedIncidents.push(result.value.data.incident);
          }
        } else {
          errorCount++;
        }
      });

      if (detectedIncidents.length > 0) {
        toast.success(`🤖 Auto-detected ${detectedIncidents.length} incident(s)!`, {
          duration: 6000,
        });
      } else if (successCount > 0) {
        toast.success(`✅ No incidents detected in ${successCount} service(s)`);
      }

      if (errorCount > 0) {
        toast.error(`Failed to analyze ${errorCount} service(s)`);
      }

    } catch (error) {
      console.error('Error in auto-detection:', error);
      toast.error('Auto-detection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">🤖 AI Auto-Detection</h3>
        </div>
        
        <button
          onClick={handleAutoDetect}
          disabled={loading || settings.selectedServices.length === 0}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            '🔍 Run Auto-Detection'
          )}
        </button>
      </div>

      {/* Description */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">How Auto-Detection Works</h4>
            <p className="mt-1 text-sm text-blue-700">
              AI analyzes service logs to automatically detect potential incidents based on patterns like 
              consecutive failures, high response times, and unusual error rates. Configure the threshold 
              below and select services to monitor.
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        {/* Threshold Setting */}
        <div>
          <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
            Detection Threshold (minutes)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              id="threshold"
              min="1"
              max="30"
              value={settings.thresholdMinutes}
              onChange={(e) => setSettings(prev => ({ ...prev, thresholdMinutes: parseInt(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-900 w-16">
              {settings.thresholdMinutes} min
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Minimum duration of consecutive failures to trigger incident detection
          </p>
        </div>

        {/* Service Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Services to Monitor
            </label>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {settings.selectedServices.length === services.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No services available</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3">
              <div className="space-y-2">
                {services.map(service => (
                  <label key={service._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.selectedServices.includes(service._id)}
                        onChange={() => handleServiceToggle(service._id)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-700">{service.name}</span>
                        <div className="text-xs text-gray-500">{service.url}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        service.status === 'UP' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.status}
                      </span>
                      {service.lastChecked && (
                        <span className="text-xs text-gray-400">
                          {new Date(service.lastChecked).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 text-sm text-gray-600">
            {settings.selectedServices.length} of {services.length} services selected
          </div>
        </div>

        {/* Detection Features */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Detection Features</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center">
              <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Consecutive Failures
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              High Response Times
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Error Rate Spikes
            </div>
            <div className="flex items-center">
              <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Pattern Recognition
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDetectionPanel;

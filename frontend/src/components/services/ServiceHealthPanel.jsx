import React, { useState } from 'react';
import { getServiceHealthSummary } from '../../utils/api';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const ServiceHealthPanel = ({ service }) => {
  const [healthSummary, setHealthSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDays, setSelectedDays] = useState(7);

  const handleGenerateHealthSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getServiceHealthSummary(service._id, selectedDays);
      setHealthSummary(response.data);
      toast.success('Health summary generated successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate health summary';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error generating health summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (healthSummary?.summary) {
      navigator.clipboard.writeText(healthSummary.summary);
      toast.success('Health summary copied to clipboard');
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 85) return 'text-yellow-600 bg-yellow-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">📊 Service Health Analysis</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          {healthSummary && (
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50 transition-colors"
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
          )}
          
          <button
            onClick={handleGenerateHealthSummary}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              healthSummary ? '🔄 Refresh Analysis' : '✨ Generate Health Summary'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {healthSummary ? (
        <div className="space-y-6">
          {/* Health Score */}
          {healthSummary.healthScore !== undefined && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Overall Health Score</h4>
                  <p className="text-sm text-gray-600">Based on {selectedDays} days of data</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-2xl font-bold ${getHealthScoreColor(healthSummary.healthScore)}`}>
                    {Math.round(healthSummary.healthScore)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {getHealthScoreLabel(healthSummary.healthScore)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          {healthSummary.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {healthSummary.metrics.uptime !== undefined && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Uptime</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(healthSummary.metrics.uptime * 100) / 100}%
                  </div>
                </div>
              )}
              
              {healthSummary.metrics.avgResponseTime !== undefined && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Avg Response</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(healthSummary.metrics.avgResponseTime)}ms
                  </div>
                </div>
              )}
              
              {healthSummary.metrics.incidentCount !== undefined && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Incidents</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {healthSummary.metrics.incidentCount}
                  </div>
                </div>
              )}
              
              {healthSummary.metrics.errorRate !== undefined && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">Error Rate</div>
                  <div className="text-2xl font-bold text-red-600">
                    {Math.round(healthSummary.metrics.errorRate * 100) / 100}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Summary */}
          {healthSummary.summary && (
            <div className="prose prose-sm max-w-none">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                    🤖 AI Health Analysis
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    Generated on {new Date().toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-800">
                  <ReactMarkdown 
                    components={{
                      h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 text-gray-900">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-md font-semibold mb-2 text-gray-800">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-gray-700">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
                      p: ({ children }) => <p className="mb-2 text-sm text-gray-700">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    }}
                  >
                    {healthSummary.summary}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {healthSummary.recommendations && healthSummary.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                {healthSummary.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No health analysis available yet.</p>
          <p className="text-xs text-gray-400 mt-1">Click "Generate Health Summary" to analyze service performance with AI.</p>
        </div>
      )}

      {/* Analysis Features */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Health Analysis Features:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Performance Trends
          </div>
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Uptime Analysis
          </div>
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Issue Identification
          </div>
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Optimization Tips
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHealthPanel;

import React, { useState, useEffect } from 'react';
import { getServiceLogs } from '../../utils/api';
import { format } from 'date-fns';

const RelatedLogs = ({ incident }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState('all');

  useEffect(() => {
    const fetchRelatedLogs = async () => {
      try {
        setLoading(true);
        const allLogs = [];

        // Fetch logs for affected services
        const servicesToFetch = selectedService === 'all' 
          ? incident.affectedServices 
          : incident.affectedServices.filter(service => service._id === selectedService);

        for (const service of servicesToFetch) {
          try {
            const response = await getServiceLogs(service._id);
            const serviceLogs = response.data.map(log => ({
              ...log,
              serviceName: service.name,
              serviceId: service._id
            }));
            allLogs.push(...serviceLogs);
          } catch (err) {
            console.error(`Error fetching logs for service ${service.name}:`, err);
          }
        }

        // Filter logs to incident timeframe (with some buffer)
        const incidentStart = new Date(incident.startTime || incident.createdAt);
        const incidentEnd = incident.endTime ? new Date(incident.endTime) : new Date();
        
        // Add 1 hour buffer before and after
        const filterStart = new Date(incidentStart.getTime() - (60 * 60 * 1000));
        const filterEnd = new Date(incidentEnd.getTime() + (60 * 60 * 1000));

        const filteredLogs = allLogs.filter(log => {
          const logTime = new Date(log.timestamp);
          return logTime >= filterStart && logTime <= filterEnd;
        });

        // Sort by timestamp (newest first)
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setLogs(filteredLogs);
        setError(null);
      } catch (err) {
        setError('Failed to fetch related logs');
        console.error('Error fetching related logs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (incident.affectedServices && incident.affectedServices.length > 0) {
      fetchRelatedLogs();
    } else {
      setLoading(false);
    }
  }, [incident, selectedService]);

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'UP':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'DOWN':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const getResponseTimeColor = (responseTime) => {
    if (!responseTime) return 'text-gray-500';
    if (responseTime < 500) return 'text-green-600';
    if (responseTime < 1000) return 'text-yellow-600';
    if (responseTime < 3000) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!incident.affectedServices || incident.affectedServices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>No services affected - no related logs available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Related Service Logs</h3>
        
        {/* Service Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="service-filter" className="text-sm text-gray-700">
            Filter by service:
          </label>
          <select
            id="service-filter"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Services</option>
            {incident.affectedServices.map(service => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No logs found for the incident timeframe</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Logs Count */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {logs.length} log entries from {incident.affectedServices.length} service(s)
          </div>

          {/* Logs List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <tr key={`${log.serviceId}-${log.timestamp}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.serviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(log.status)}>
                          {log.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getResponseTimeColor(log.responseTime)}`}>
                        {log.responseTime ? `${log.responseTime}ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {log.error || log.message || 'Routine check'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logs Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Log Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Logs:</span>
                <div className="font-medium text-gray-900">{logs.length}</div>
              </div>
              <div>
                <span className="text-gray-500">Failed Checks:</span>
                <div className="font-medium text-red-600">
                  {logs.filter(log => log.status === 'DOWN').length}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Successful Checks:</span>
                <div className="font-medium text-green-600">
                  {logs.filter(log => log.status === 'UP').length}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Avg Response Time:</span>
                <div className="font-medium text-gray-900">
                  {logs.length > 0 ? (
                    Math.round(
                      logs
                        .filter(log => log.responseTime)
                        .reduce((sum, log) => sum + log.responseTime, 0) /
                      logs.filter(log => log.responseTime).length
                    ) + 'ms'
                  ) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatedLogs;

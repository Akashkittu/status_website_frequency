import React, { useState, useEffect, useCallback } from 'react';
import { getServiceLogs } from '../../utils/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ServiceLogsModal = ({ service, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getServiceLogs(service._id);
      setLogs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch service logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  }, [service._id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, timeRange]);

  const filterLogsByTimeRange = (logs) => {
    const now = new Date();
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const cutoff = new Date(now.getTime() - timeRanges[timeRange]);
    return logs.filter(log => new Date(log.timestamp) >= cutoff);
  };

  const filteredLogs = filterLogsByTimeRange(logs);

  // Prepare chart data
  const latencyData = {
    labels: filteredLogs
      .filter(log => log.status === 'UP' && log.latency)
      .map(log => new Date(log.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Response Time (ms)',
        data: filteredLogs
          .filter(log => log.status === 'UP' && log.latency)
          .map(log => log.latency),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const statusData = {
    labels: filteredLogs.map(log => new Date(log.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Status',
        data: filteredLogs.map(log => log.status === 'UP' ? 1 : 0),
        backgroundColor: filteredLogs.map(log => 
          log.status === 'UP' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: filteredLogs.map(log => 
          log.status === 'UP' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Service Monitoring Data',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  const statusChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        display: true,
        title: {
          display: true,
          text: 'Status (1=UP, 0=DOWN)',
        },
        min: 0,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return value === 1 ? 'UP' : 'DOWN';
          }
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Service Logs - {service.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No logs available for the selected time range.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Latency Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Response Time</h3>
              <Line data={latencyData} options={chartOptions} />
            </div>

            {/* Status Timeline */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>
              <Bar data={statusData} options={statusChartOptions} />
            </div>

            {/* Recent Logs Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Latency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.slice(0, 20).map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.status === 'UP' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {log.latency ? `${log.latency}ms` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceLogsModal;

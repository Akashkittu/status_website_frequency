import React from 'react';

const ServiceStatusCard = ({ service }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'UP':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DOWN':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getUptimeBadgeColor = (uptime) => {
    if (uptime >= 99) return 'bg-green-500';
    if (uptime >= 95) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatLatency = (latency) => {
    if (!latency) return 'N/A';
    return `${latency}ms`;
  };

  const formatUptime = (uptime) => {
    if (uptime === null || uptime === undefined) return 'N/A';
    return `${uptime.toFixed(2)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
          <p className="text-sm text-gray-500">{service.url}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Uptime Badge */}
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Uptime:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getUptimeBadgeColor(service.uptime)}`}>
              {formatUptime(service.uptime)}
            </span>
          </div>
          
          {/* Latency */}
          {service.status === 'UP' && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Latency:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatLatency(service.latency)}
              </span>
            </div>
          )}
          
          {/* Status Badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(service.status)}`}>
            <span className={`w-2 h-2 mr-2 rounded-full ${service.status === 'UP' ? 'bg-green-400' : 'bg-red-400'}`}></span>
            {service.status || 'UNKNOWN'}
          </span>
        </div>
      </div>
      
      {/* Last Check Time */}
      {service.lastChecked && (
        <div className="mt-3 text-xs text-gray-500">
          Last checked: {new Date(service.lastChecked).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default ServiceStatusCard;

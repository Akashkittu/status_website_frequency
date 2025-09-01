import React, { useState, useEffect } from 'react';
import { getServices } from '../../utils/api';
import ServiceStatusCard from './ServiceStatusCard';
import IncidentBanner from './IncidentBanner';
import { useSocket } from '../../hooks/useSocket';

const StatusDashboard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchServices();
    
    // Set up WebSocket listeners for real-time updates
    socket.on('serviceStatusUpdate', handleServiceUpdate);
    socket.on('newServiceRegistered', handleNewService);
    
    // Set up polling as fallback for real-time updates
    const interval = setInterval(fetchServices, 60000); // Update every minute as fallback
    
    return () => {
      clearInterval(interval);
      socket.off('serviceStatusUpdate', handleServiceUpdate);
      socket.off('newServiceRegistered', handleNewService);
    };
  }, [socket]);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceUpdate = (updatedService) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service._id === updatedService._id 
          ? { ...service, ...updatedService }
          : service
      )
    );
  };

  const handleNewService = (newService) => {
    setServices(prevServices => [...prevServices, newService]);
  };

  const downServices = services.filter(service => service.status === 'DOWN');
  const hasIncidents = downServices.length > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {hasIncidents && <IncidentBanner downServices={downServices} />}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Service Status</h1>
        <p className="text-gray-600 text-center">
          Real-time monitoring of all services
        </p>
      </div>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No services are being monitored yet.</p>
          </div>
        ) : (
          services.map(service => (
            <ServiceStatusCard key={service._id} service={service} />
          ))
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default StatusDashboard;

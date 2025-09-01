import React, { useEffect, useState } from 'react';
import { getServices } from '../../utils/api';
import ServiceCard from './ServiceCard';
import socket from '../../utils/socket';
import toast from 'react-hot-toast';

const ServiceList = ({ isAdmin = false }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();

    // Socket listeners for real-time updates
    socket.on('serviceUpdated', handleServiceUpdate);
    socket.on('serviceCreated', handleServiceCreate);
    socket.on('serviceDeleted', handleServiceDelete);

    return () => {
      socket.off('serviceUpdated');
      socket.off('serviceCreated');
      socket.off('serviceDeleted');
    };
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response.data);
    } catch (error) {
      toast.error('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceUpdate = (updatedService) => {
    setServices(prev =>
      prev.map(service =>
        service._id === updatedService._id ? updatedService : service
      )
    );
  };

  const handleServiceCreate = (newService) => {
    setServices(prev => [...prev, newService]);
  };

  const handleServiceDelete = (serviceId) => {
    setServices(prev => prev.filter(service => service._id !== serviceId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map(service => (
        <ServiceCard
          key={service._id}
          service={service}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default ServiceList;
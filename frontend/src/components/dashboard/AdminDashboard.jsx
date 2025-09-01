import React, { useState, useEffect } from 'react';
import { getServices, getAllIncidents } from '../../utils/api';
import ServiceForm from '../services/ServiceForm';
import AdminServiceTable from '../services/AdminServiceTable';
import ServiceLogsModal from '../services/ServiceLogsModal';
import ServiceHealthPanel from '../services/ServiceHealthPanel';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showAddService, setShowAddService] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showHealthPanel, setShowHealthPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [servicesResponse, incidentsResponse] = await Promise.all([
        getServices(),
        getAllIncidents()
      ]);
      setServices(servicesResponse.data);
      setIncidents(incidentsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceCreated = (newService) => {
    setServices(prev => [...prev, newService]);
  };

  const handleViewLogs = (service) => {
    setSelectedService(service);
    setShowLogs(true);
  };

  const handleViewHealth = (service) => {
    setSelectedService(service);
    setShowHealthPanel(true);
  };

  const totalServices = services.length;
  const upServices = services.filter(s => s.status === 'UP').length;
  const downServices = services.filter(s => s.status === 'DOWN').length;
  // const maintenanceServices = services.filter(s => s.status === 'MAINTENANCE').length;

  // Incident stats
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your services and incidents</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/incidents')}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
          >
            🚨 Manage Incidents
          </button>
          <button
            onClick={() => setShowAddService(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Register New Service
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Services Up</p>
              <p className="text-2xl font-bold text-green-600">{upServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Services Down</p>
              <p className="text-2xl font-bold text-red-600">{downServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h4m6-8a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Incidents</p>
              <p className="text-2xl font-bold text-orange-600">{openIncidents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Incident Stats */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalIncidents}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{openIncidents}</div>
            <div className="text-sm text-gray-600">Open</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{resolvedIncidents}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{criticalIncidents}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => navigate('/incidents')}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            View All Incidents →
          </button>
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <AdminServiceTable 
          services={services} 
          onViewLogs={handleViewLogs}
          onViewHealth={handleViewHealth}
          onRefresh={fetchData}
        />
      )}

      {/* Modals */}
      {showAddService && (
        <ServiceForm 
          onClose={() => setShowAddService(false)} 
          onServiceCreated={handleServiceCreated}
        />
      )}

      {showLogs && selectedService && (
        <ServiceLogsModal 
          service={selectedService}
          onClose={() => {
            setShowLogs(false);
            setSelectedService(null);
          }}
        />
      )}

      {showHealthPanel && selectedService && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Health Analysis - {selectedService.name}</h3>
              <button
                onClick={() => {
                  setShowHealthPanel(false);
                  setSelectedService(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ServiceHealthPanel service={selectedService} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
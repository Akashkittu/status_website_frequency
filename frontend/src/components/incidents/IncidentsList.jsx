import React, { useState, useEffect } from 'react';
import { getAllIncidents } from '../../utils/api';
import { useSocket } from '../../hooks/useSocket';
import IncidentCard from './IncidentCard';
import IncidentFilters from './IncidentFilters';
import CreateIncidentModal from './CreateIncidentModal';
import toast from 'react-hot-toast';

const IncidentsList = ({ onIncidentClick }) => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchIncidents();
    
    // Set up WebSocket listeners for real-time updates
    socket.on('newIncident', handleNewIncident);
    socket.on('incidentUpdated', handleIncidentUpdated);
    socket.on('autoIncidentDetected', handleAutoIncidentDetected);
    
    return () => {
      socket.off('newIncident', handleNewIncident);
      socket.off('incidentUpdated', handleIncidentUpdated);
      socket.off('autoIncidentDetected', handleAutoIncidentDetected);
    };
  }, [socket]);

  const fetchIncidents = async () => {
    try {
      const response = await getAllIncidents();
      setIncidents(response.data);
      setFilteredIncidents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch incidents');
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewIncident = (incident) => {
    setIncidents(prev => [incident, ...prev]);
    setFilteredIncidents(prev => [incident, ...prev]);
    toast.success(`New incident detected: ${incident.title}`);
  };

  const handleIncidentUpdated = (updatedIncident) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident._id === updatedIncident._id ? updatedIncident : incident
      )
    );
    setFilteredIncidents(prev => 
      prev.map(incident => 
        incident._id === updatedIncident._id ? updatedIncident : incident
      )
    );
    toast.success(`Incident updated: ${updatedIncident.title}`);
  };

  const handleAutoIncidentDetected = (incident) => {
    setIncidents(prev => [incident, ...prev]);
    setFilteredIncidents(prev => [incident, ...prev]);
    toast.error(`🤖 Auto-detected incident: ${incident.title}`, {
      duration: 6000,
    });
  };

  const handleIncidentCreated = (newIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
    setFilteredIncidents(prev => [newIncident, ...prev]);
    setShowCreateModal(false);
  };

  const handleFilterChange = (filters) => {
    let filtered = [...incidents];
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(incident => 
        incident.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    if (filters.severity && filters.severity !== 'all') {
      filtered = filtered.filter(incident => 
        incident.severity?.toLowerCase() === filters.severity.toLowerCase()
      );
    }
    
    if (filters.service && filters.service !== 'all') {
      filtered = filtered.filter(incident => 
        incident.affectedServices?.some(service => service._id === filters.service)
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(incident => 
        incident.title?.toLowerCase().includes(searchLower) ||
        incident.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredIncidents(filtered);
  };

  const getIncidentStats = () => {
    const stats = {
      total: incidents.length,
      open: incidents.filter(i => i.status === 'open').length,
      resolved: incidents.filter(i => i.status === 'resolved').length,
      critical: incidents.filter(i => i.severity === 'critical').length,
    };
    return stats;
  };

  const stats = getIncidentStats();

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
        <button 
          onClick={fetchIncidents}
          className="ml-4 text-red-800 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage service incidents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Report Incident
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-red-600">{stats.open}</p>
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
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
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
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-orange-600">{stats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <IncidentFilters onFilterChange={handleFilterChange} />

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {incidents.length === 0 
                ? "No incidents have been reported yet." 
                : "No incidents match your current filters."
              }
            </p>
          </div>
        ) : (
          filteredIncidents.map(incident => (
            <IncidentCard 
              key={incident._id} 
              incident={incident} 
              onClick={onIncidentClick}
            />
          ))
        )}
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <CreateIncidentModal 
          onClose={() => setShowCreateModal(false)}
          onIncidentCreated={handleIncidentCreated}
        />
      )}
    </div>
  );
};

export default IncidentsList;

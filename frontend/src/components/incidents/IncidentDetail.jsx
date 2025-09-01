import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIncident, updateIncident, resolveIncident } from '../../utils/api';
import { format } from 'date-fns';
import AISummaryPanel from './AISummaryPanel';
import IncidentTimeline from './IncidentTimeline';
import RelatedLogs from './RelatedLogs';
import toast from 'react-hot-toast';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await getIncident(id);
        setIncident(response.data);
        setFormData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch incident details');
        console.error('Error fetching incident:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIncident();
    }
  }, [id]);

  const handleSummaryUpdated = (updatedIncident) => {
    setIncident(updatedIncident);
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing) {
      setFormData(incident);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await updateIncident(id, formData);
      setIncident(response.data);
      setEditing(false);
      toast.success('Incident updated successfully');
    } catch (error) {
      toast.error('Failed to update incident');
      console.error('Error updating incident:', error);
    }
  };

  const handleResolveIncident = async () => {
    if (!window.confirm('Are you sure you want to resolve this incident?')) {
      return;
    }

    try {
      const response = await resolveIncident(id);
      setIncident(response.data);
      toast.success('Incident resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve incident');
      console.error('Error resolving incident:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'monitoring':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Incident not found'}
        <button 
          onClick={() => navigate('/incidents')}
          className="ml-4 text-red-800 underline hover:no-underline"
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={() => navigate('/incidents')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {editing ? (
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="text-2xl font-bold border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                  />
                ) : (
                  incident.title
                )}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(incident.severity)}`}>
                {incident.severity || 'Unknown'}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(incident.status)}`}>
                {incident.status || 'Open'}
              </span>
              <span className="text-sm text-gray-500">
                Duration: {formatDuration(incident.startTime, incident.endTime)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span>
                <br />
                {format(new Date(incident.createdAt), 'MMM dd, yyyy HH:mm')}
              </div>
              <div>
                <span className="font-medium">Started:</span>
                <br />
                {incident.startTime ? format(new Date(incident.startTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Resolved:</span>
                <br />
                {incident.endTime ? format(new Date(incident.endTime), 'MMM dd, yyyy HH:mm') : 'Ongoing'}
              </div>
              <div>
                <span className="font-medium">Affected Services:</span>
                <br />
                {incident.affectedServices?.length || 0} service(s)
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {editing ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                {incident.status !== 'resolved' && (
                  <button
                    onClick={handleResolveIncident}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'ai-summary', name: '🤖 AI Summary' },
              { id: 'timeline', name: 'Timeline' },
              { id: 'logs', name: 'Related Logs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                {editing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{incident.description}</p>
                )}
              </div>

              {incident.affectedServices && incident.affectedServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Affected Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {incident.affectedServices.map(service => (
                      <div key={service._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.url}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.status === 'UP' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-summary' && (
            <AISummaryPanel 
              incident={incident} 
              onSummaryUpdated={handleSummaryUpdated}
            />
          )}

          {activeTab === 'timeline' && (
            <IncidentTimeline incident={incident} />
          )}

          {activeTab === 'logs' && (
            <RelatedLogs incident={incident} />
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;

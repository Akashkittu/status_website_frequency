import React from 'react';
import { format } from 'date-fns';

const IncidentTimeline = ({ incident }) => {
  // Generate timeline events from incident data
  const generateTimelineEvents = () => {
    const events = [];

    // Incident created
    events.push({
      id: 'created',
      type: 'created',
      title: 'Incident Reported',
      description: `Incident "${incident.title}" was reported`,
      timestamp: incident.createdAt,
      icon: '🚨',
      color: 'red'
    });

    // Incident started (if different from created)
    if (incident.startTime && incident.startTime !== incident.createdAt) {
      events.push({
        id: 'started',
        type: 'started',
        title: 'Incident Started',
        description: 'Service disruption began',
        timestamp: incident.startTime,
        icon: '⚠️',
        color: 'orange'
      });
    }

    // Status updates (if available)
    if (incident.status === 'investigating') {
      events.push({
        id: 'investigating',
        type: 'status_update',
        title: 'Investigation Started',
        description: 'Team is investigating the issue',
        timestamp: incident.updatedAt,
        icon: '🔍',
        color: 'yellow'
      });
    }

    // AI Summary generated
    if (incident.aiSummary) {
      events.push({
        id: 'ai_summary',
        type: 'ai_analysis',
        title: 'AI Analysis Completed',
        description: 'AI generated incident summary and recommendations',
        timestamp: incident.updatedAt,
        icon: '🤖',
        color: 'blue'
      });
    }

    // Incident resolved
    if (incident.status === 'resolved' && incident.endTime) {
      events.push({
        id: 'resolved',
        type: 'resolved',
        title: 'Incident Resolved',
        description: 'All services restored to normal operation',
        timestamp: incident.endTime,
        icon: '✅',
        color: 'green'
      });
    }

    // Sort events by timestamp
    return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const events = generateTimelineEvents();

  const getEventColor = (color) => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'orange':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'blue':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'green':
        return 'bg-green-100 text-green-600 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getConnectorColor = (color) => {
    switch (color) {
      case 'red':
        return 'border-red-300';
      case 'orange':
        return 'border-orange-300';
      case 'yellow':
        return 'border-yellow-300';
      case 'blue':
        return 'border-blue-300';
      case 'green':
        return 'border-green-300';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Incident Timeline</h3>
        <div className="text-sm text-gray-500">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No timeline events available</p>
        </div>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {events.map((event, eventIdx) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {eventIdx !== events.length - 1 ? (
                    <span
                      className={`absolute top-4 left-4 -ml-px h-full w-0.5 border-l-2 ${getConnectorColor(event.color)}`}
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm ${getEventColor(event.color)}`}>
                        {event.icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {event.description}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={event.timestamp}>
                          {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Incident Duration Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Incident Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Status:</span>
            <div className="font-medium text-gray-900">{incident.status}</div>
          </div>
          <div>
            <span className="text-gray-500">Severity:</span>
            <div className="font-medium text-gray-900">{incident.severity}</div>
          </div>
          <div>
            <span className="text-gray-500">Duration:</span>
            <div className="font-medium text-gray-900">
              {incident.startTime && incident.endTime ? (
                (() => {
                  const start = new Date(incident.startTime);
                  const end = new Date(incident.endTime);
                  const durationMs = end - start;
                  const minutes = Math.floor(durationMs / 60000);
                  const hours = Math.floor(minutes / 60);
                  const days = Math.floor(hours / 24);

                  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
                  if (hours > 0) return `${hours}h ${minutes % 60}m`;
                  return `${minutes}m`;
                })()
              ) : (
                'Ongoing'
              )}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Services:</span>
            <div className="font-medium text-gray-900">
              {incident.affectedServices?.length || 0} affected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentTimeline;

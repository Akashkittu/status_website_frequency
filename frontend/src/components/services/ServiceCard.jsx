import React from 'react';
import { updateService, deleteService } from '../../utils/api';
import toast from 'react-hot-toast';

const ServiceCard = ({ service, isAdmin }) => {
  const handleStatusChange = async (newStatus) => {
    try {
      await updateService(service._id, { status: newStatus });
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(service._id);
        toast.success('Service deleted successfully');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'degraded-performance':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial-outage':
        return 'bg-orange-100 text-orange-800';
      case 'major-outage':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{service.name}</h3>
        {isAdmin && (
          <div className="relative">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                const dropdown = document.getElementById(`dropdown-${service._id}`);
                dropdown.classList.toggle('hidden');
              }}
            >
              ⋮
            </button>
            <div
              id={`dropdown-${service._id}`}
              className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
            >
              <div className="py-1">
                <button
                  onClick={() => handleStatusChange('operational')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Set Operational
                </button>
                <button
                  onClick={() => handleStatusChange('degraded-performance')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Set Degraded
                </button>
                <button
                  onClick={() => handleStatusChange('major-outage')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Set Major Outage
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <span className={`inline-block px-2 py-1 rounded-full text-sm mt-2 ${getStatusColor(service.status)}`}>
        {service.status}
      </span>
      <p className="text-sm text-gray-500 mt-2">
        Last updated: {new Date(service.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
};

export default ServiceCard;
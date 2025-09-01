import React from 'react';
import StatusDashboard from '../status/StatusDashboard';

const UserDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center">User Dashboard</h1>
        <p className="text-gray-600 mt-2 text-center">
          Monitor the current status of all services
        </p>
      </div>

      <StatusDashboard />
    </div>
  );
};

export default UserDashboard;
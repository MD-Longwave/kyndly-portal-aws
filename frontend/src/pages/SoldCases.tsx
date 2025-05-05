import React from 'react';

const SoldCases: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary-800">Sold Cases</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-secondary-800 mb-2">Coming Soon</h2>
          <p className="text-gray-500">
            The Sold Cases feature is currently under development. Check back soon for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SoldCases; 
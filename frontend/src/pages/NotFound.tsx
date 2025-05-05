import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mb-6 text-3xl font-bold text-neutral-800">Page Not Found</h2>
        <p className="mb-8 text-lg text-neutral-600">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="rounded-md bg-primary-600 px-6 py-3 font-medium text-white shadow-md hover:bg-primary-700"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 
import React from 'react';
import { FadeIn } from '../animations';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-50">
      <FadeIn>
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
          <h2 className="text-xl font-semibold text-neutral-700">Loading...</h2>
          <p className="mt-2 text-neutral-500">Please wait while we prepare your experience</p>
        </div>
      </FadeIn>
    </div>
  );
};

export default LoadingScreen; 
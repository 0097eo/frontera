import React from 'react';
import { Home, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Error500 = ({ onRetry }) => {
  return (
    <div className="bg-amber-50 flex flex-col items-center justify-center min-h-[400px] py-12 px-4 rounded-lg shadow-sm">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-red-500"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Server Error</h2>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        We're experiencing some technical difficulties right now. 
        Please try again later or contact support if the problem persists.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={onRetry} 
          className="flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
        >
          <RefreshCcw size={18} />
          Try Again
        </button>
        
        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Error500;
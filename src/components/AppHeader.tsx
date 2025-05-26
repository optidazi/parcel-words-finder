
import React from 'react';
import { Package, MapPin } from 'lucide-react';

const AppHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">what3words Parcel Scanner</h1>
              <p className="text-sm text-gray-600">Scan delivery information for precise addresses</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Android Tablet</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

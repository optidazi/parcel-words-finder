
import React from 'react';
import AppHeader from '@/components/AppHeader';
import ScannerInterface from '@/components/ScannerInterface';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="py-6">
        <ScannerInterface />
      </main>
    </div>
  );
};

export default Index;

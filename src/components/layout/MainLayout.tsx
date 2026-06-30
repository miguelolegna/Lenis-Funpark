import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MapSection from './MapSection';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary selection:text-white">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <MapSection />
      <Footer />
    </div>
  );
}

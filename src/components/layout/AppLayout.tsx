import React from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

interface AppLayoutProps {
  readonly showNotice?: boolean;
}

/** Shared shell (GNB + footer) for all marketplace pages. */
export const AppLayout: React.FC<AppLayoutProps> = ({ showNotice = true }) => (
  <div className="min-h-screen flex flex-col bg-canvas">
    <Header showNotice={showNotice} />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default AppLayout;

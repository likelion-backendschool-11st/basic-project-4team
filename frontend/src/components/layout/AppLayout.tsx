import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChatProvider } from '../chat/ChatProvider';
import { RouteErrorBoundary } from '../common/RouteErrorBoundary';
import { Footer } from './Footer';
import { Header } from './Header';

interface AppLayoutProps {
  readonly showNotice?: boolean;
}

/** Shared shell (GNB + footer) for all marketplace pages. 채팅 창은 ChatProvider가 한 곳에 그린다. */
export const AppLayout: React.FC<AppLayoutProps> = ({ showNotice = true }) => {
  const { pathname } = useLocation();
  return (
    <ChatProvider>
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header showNotice={showNotice} />
      <main className="flex-1">
        {/* 페이지에서 오류가 나도 헤더·푸터는 남기고, 다른 페이지로 이동하면 다시 그린다. */}
        <RouteErrorBoundary resetKey={pathname}>
          <Outlet />
        </RouteErrorBoundary>
      </main>
      <Footer />
    </div>
    </ChatProvider>
  );
};

export default AppLayout;

import React from 'react';
import { AuthFooter } from './AuthFooter';
import { AuthTopBar } from './AuthTopBar';

interface AuthPageShellProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

/** 로그인·회원가입·계정 찾기 화면 공통 틀 (AppLayout 없이 단독 화면). */
export const AuthPageShell: React.FC<AuthPageShellProps> = ({ children, className = '' }) => (
  <div className={`bg-canvas-soft text-body min-h-screen flex flex-col justify-between selection:bg-mint-100 selection:text-ink ${className}`}>
    <AuthTopBar />
    <main className="flex-grow flex items-center justify-center px-4 py-12">{children}</main>
    <AuthFooter />
  </div>
);

export default AuthPageShell;

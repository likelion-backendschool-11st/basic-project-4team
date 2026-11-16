import React from 'react';

interface AuthCardProps {
  readonly title: string;
  /** 제목 아래 한두 줄 설명 (회원가입·찾기 화면). */
  readonly description?: string;
  readonly children: React.ReactNode;
}

/* data-component="AuthCard" data-purpose="login-card" */
export const AuthCard: React.FC<AuthCardProps> = ({ title, description, children }) => (
  <div className="w-full max-w-[440px] bg-canvas border border-hairline-strong rounded-xl shadow-sm p-8 sm:p-10">
    {/* data-component="AuthLogoBlock" */}
    <div className="text-center mb-8">
      <h1 className="font-heading-1-mobile text-heading-1-mobile sm:text-heading-2 tracking-tight text-ink mb-2">{title}</h1>
      {description && <p className="text-sm text-muted leading-relaxed break-keep">{description}</p>}
    </div>
    {children}
  </div>
);

export default AuthCard;

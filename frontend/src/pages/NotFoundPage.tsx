import React from 'react';
import { ErrorPageContent } from '../components/common/ErrorPageContent';

interface NotFoundPageProps {
  readonly className?: string;
}

/** 없는 주소 (404) — 라우트에 없는 모든 경로 (#21). */
export const NotFoundPage: React.FC<NotFoundPageProps> = ({ className = '' }) => (
  <div className={className}>
    <ErrorPageContent variant="notFound" />
  </div>
);

export default NotFoundPage;

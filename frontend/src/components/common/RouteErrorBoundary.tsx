import React from 'react';
import { ErrorPageContent } from './ErrorPageContent';

interface RouteErrorBoundaryProps {
  readonly children: React.ReactNode;
  /** 바뀌면 오류 상태를 초기화한다 (다른 페이지로 이동). */
  readonly resetKey: string;
}

interface RouteErrorBoundaryState {
  readonly error: Error | null;
  readonly resetKey: string;
}

/** 페이지 렌더링 중 예상치 못한 오류가 나면 흰 화면 대신 오류 페이지를 보여준다 (#21). 헤더·푸터는 유지. */
export class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<RouteErrorBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(props: RouteErrorBoundaryProps, state: RouteErrorBoundaryState): Partial<RouteErrorBoundaryState> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null;
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[RouteErrorBoundary]', error, info.componentStack);
  }

  render(): React.ReactNode {
    if (this.state.error) return <ErrorPageContent onReload={() => window.location.reload()} variant="crash" />;
    return this.props.children;
  }
}

export default RouteErrorBoundary;

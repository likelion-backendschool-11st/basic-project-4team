import { useLocation } from 'react-router-dom';

/** Returns a predicate telling whether a nav target matches the current path. */
export function useActiveRoute() {
  const { pathname } = useLocation();
  return (to: string) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`));
}

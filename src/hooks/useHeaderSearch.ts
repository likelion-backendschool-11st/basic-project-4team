import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../data/layout';

/** Header search box state; submits to /search?q=... */
export function useHeaderSearch() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `${ROUTES.search}?q=${encodeURIComponent(q)}` : ROUTES.search);
  };
  return { query, setQuery, onSubmit };
}

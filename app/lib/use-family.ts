import { useCallback, useEffect, useState } from 'react';
import { api, FamilyMe } from './api';

export function useFamily() {
  const [data, setData] = useState<FamilyMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const me = await api.me();
      setData(me);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function dollarsFromPoints(points: number, pointValueCents: number) {
  const cents = points * pointValueCents;
  const dollars = cents / 100;
  return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

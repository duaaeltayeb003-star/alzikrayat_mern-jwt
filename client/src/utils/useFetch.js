import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// Loads data from the API with useEffect and tracks loading / error state.
// reload() fetches again; setData() lets a page update the list locally
// (for example, adding a new comment without a full reload).
export default function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));

    api
      .get(path)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: '' });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message });
      });

    return () => {
      cancelled = true; // ignore results that arrive after leaving the page
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const setData = useCallback(
    (update) =>
      setState((s) => ({ ...s, data: typeof update === 'function' ? update(s.data) : update })),
    []
  );

  return { ...state, reload, setData };
}

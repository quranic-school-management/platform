import { useEffect, useState } from 'react';

/**
 * Runs an async loader and exposes { data, loading, error, reload }.
 * When `deps` change, stale data is hidden immediately (loading = true) so pages never render
 * the previous result with the new inputs.
 */
export default function useAsync(fn, deps = []) {
  const [n, setN] = useState(0);
  const key = `${JSON.stringify(deps)}:${n}`;
  const [state, setState] = useState({ key, data: null, loading: true, error: null });
  useEffect(() => {
    let on = true;
    setState({ key, data: null, loading: true, error: null });
    fn().then(
      (data) => on && setState({ key, data, loading: false, error: null }),
      (error) => on && setState({ key, data: null, loading: false, error }),
    );
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const current = state.key === key ? state : { data: null, loading: true, error: null };
  return { data: current.data, loading: current.loading, error: current.error, reload: () => setN((x) => x + 1) };
}

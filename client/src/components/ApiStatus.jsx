import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function ApiStatus() {
  const [status, setStatus] = useState('checking'); // 'ok' | 'fail' | 'checking'

  useEffect(() => {
    let cancelled = false;
    api.get('/health')
      .then(() => !cancelled && setStatus('ok'))
      .catch(() => !cancelled && setStatus('fail'));
    return () => { cancelled = true; };
  }, []);

  if (status === 'checking') {
    return <span className="badge text-bg-secondary">Checking API…</span>;
  }
  if (status === 'ok') {
    return <span className="badge text-bg-success">API Connected</span>;
  }
  return <span className="badge text-bg-danger">API Unreachable</span>;
}

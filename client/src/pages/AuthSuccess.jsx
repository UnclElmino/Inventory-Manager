import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../lib/authApi';
import { useAuth } from '../context/AuthContext';

export default function AuthSuccess() {
  const nav = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
      } finally {
        nav('/'); // go home after storing user
      }
    })();
  }, [nav, setUser]);

  return <div className="container py-5">Finishing sign-in…</div>;
}

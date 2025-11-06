import { useAuth } from '../context/AuthContext';

export default function AuthButton() {
  const { user, checking, loginWithGoogle, loginWithFacebook, logout } = useAuth();

  if (checking) {
    return <span className="badge text-bg-secondary">Checking…</span>;
  }

  if (!user) {
    return (
      <div className="d-flex gap-2">
        <button className="btn btn-outline-primary btn-sm" onClick={loginWithGoogle}>Sign in with Google</button>
        <button className="btn btn-outline-dark btn-sm" onClick={loginWithFacebook}>Facebook</button>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2">
      {user.avatar_url && (
        <img src={user.avatar_url} alt="avatar" width="28" height="28" className="rounded-circle" />
      )}
      <span className="badge text-bg-success">{user.name || 'Signed in'}</span>
      <button className="btn btn-outline-danger btn-sm" onClick={logout}>Logout</button>
    </div>
  );
}

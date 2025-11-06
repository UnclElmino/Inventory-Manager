import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navigate } from 'react-router-dom';

export default function AdminPage() {
  const { user, checking } = useAuth();
  const { push } = useToast();

  if (checking) return <div className="container py-5">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  if (!user.is_admin) return <div className="container py-5"><h3>Access denied</h3></div>;

  const [users, setUsers] = useState([]);
  const [inventories, setInventories] = useState([]);

  const load = () => {
    api.get('/admin/users').then(r=>setUsers(r.data)).catch(console.error);
    api.get('/admin/inventories').then(r=>setInventories(r.data)).catch(console.error);
  };

  useEffect(load, []);

  const toggleBlock = async (u) => {
    const act = u.is_blocked ? 'unblock' : 'block';
    await api.post(`/admin/users/${u.id}/${act}`);
    push(`${u.name} ${act}ed`);
    load();
  };

  const toggleAdmin = async (u) => {
    const act = u.is_admin ? 'demote' : 'promote';
    await api.post(`/admin/users/${u.id}/${act}`);
    push(`${u.name} ${act}d`);
    load();
  };

  const deleteInventory = async (invId) => {
    if (!window.confirm('Delete this inventory?')) return;
    await api.delete(`/admin/inventories/${invId}`);
    push('Inventory deleted', 'danger');
    load();
  };

  return (
    <div className="container py-4">
      <h2 className="h5 mb-3">Admin Dashboard</h2>

      {/* ---- Users ---- */}
      <h3 className="h6 mt-4 mb-2">Users</h3>
      <div className="table-responsive mb-4">
        <table className="table table-sm align-middle">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Admin</th><th>Blocked</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.is_admin ? '✅' : ''}</td>
                <td>{u.is_blocked ? '🚫' : ''}</td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button className={`btn btn-${u.is_admin?'warning':'success'}`} onClick={()=>toggleAdmin(u)}>
                      {u.is_admin?'Demote':'Promote'}
                    </button>
                    <button className={`btn btn-${u.is_blocked?'secondary':'danger'}`} onClick={()=>toggleBlock(u)}>
                      {u.is_blocked?'Unblock':'Block'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Inventories ---- */}
      <h3 className="h6 mt-4 mb-2">Inventories</h3>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead><tr><th>ID</th><th>Title</th><th>Owner</th><th>Category</th><th>Actions</th></tr></thead>
          <tbody>
            {inventories.map(inv=>(
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.title}</td>
                <td>{inv.owner?.name}</td>
                <td>{inv.category}</td>
                <td>
                  <button className="btn btn-outline-danger btn-sm" onClick={()=>deleteInventory(inv.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

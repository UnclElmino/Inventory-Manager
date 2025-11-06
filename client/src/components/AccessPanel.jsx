import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function AccessPanel({ inventoryId }) {
  const { push } = useToast();
  const { user } = useAuth();
  const [writers, setWriters] = useState([]);
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const load = () => {
    api.get(`/inventories/${inventoryId}/writers`)
      .then(r => setWriters(r.data))
      .catch(() => setWriters([]));
  };

  useEffect(load, [inventoryId]);

  // search users for autocomplete
  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    const id = setTimeout(() => {
      api.get('/users/search', { params: { q } })
        .then(r => setSuggestions(r.data))
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  const add = async (userId) => {
    try {
      await api.post(`/inventories/${inventoryId}/writers`, { user_id: userId });
      push('Writer added');
      setQ('');
      setSuggestions([]);
      load();
    } catch (e) {
      push('Failed to add writer', 'danger');
    }
  };

  const remove = async (userId) => {
    if (!window.confirm('Remove this writer?')) return;
    try {
      await api.delete(`/inventories/${inventoryId}/writers/${userId}`);
      push('Writer removed');
      load();
    } catch (e) {
      push('Failed to remove writer', 'danger');
    }
  };

  const isSelf = (w) => user && w.id === user.id;

  return (
    <div>
      <div className="mb-3 position-relative">
        <label className="form-label">Add writer</label>
        <input
          className="form-control"
          placeholder="Search by name or email…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {!!suggestions.length && (
          <div className="list-group position-absolute w-100" style={{ zIndex: 10 }}>
            {suggestions.map(s => (
              <button
                key={s.id}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => add(s.id)}
              >
                {s.name} <span className="text-muted ms-2 small">{s.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <h6>Current writers</h6>
      <ul className="list-group">
        {writers.map(w => (
          <li key={w.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              {w.name} <span className="text-muted small ms-2">{w.email}</span>
            </span>
            {!isSelf(w) && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => remove(w.id)}
              >
                Remove
              </button>
            )}
          </li>
        ))}
        {!writers.length && (
          <li className="list-group-item text-muted small">
            No writers yet.
          </li>
        )}
      </ul>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Stats({ inventoryId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/inventories/${inventoryId}/stats`)
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [inventoryId]);

  if (loading) return <div>Loading stats…</div>;
  if (!stats) return <div>Failed to load stats.</div>;

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <div className="card text-bg-light">
          <div className="card-body">
            <div className="card-title fw-bold">Total items</div>
            <div className="display-6">{stats.totalItems}</div>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-bg-light">
          <div className="card-body">
            <div className="card-title fw-bold">Total quantity</div>
            <div className="display-6">{stats.totalQuantity}</div>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-bg-light">
          <div className="card-body">
            <div className="card-title fw-bold">Total likes</div>
            <div className="display-6">{stats.totalLikes}</div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <h6 className="mt-3">Top liked items</h6>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Custom ID</th>
                <th>Likes</th>
              </tr>
            </thead>
            <tbody>
              {stats.topItems && stats.topItems.length ? (
                stats.topItems.map(it => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.custom_id}</td>
                    <td>{it.likeCount}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="text-muted">No liked items yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

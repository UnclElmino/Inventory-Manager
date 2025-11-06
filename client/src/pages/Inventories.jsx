import { useEffect, useState } from 'react';
import { fetchInventories, createInventory } from '../lib/invApi';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Inventories() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [list, setList] = useState({ data: [], total: 0, page: 1, pageSize });

  const load = () => {
    fetchInventories({ q, tag, page, pageSize })
      .then(setList)
      .catch(console.error);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]); // load on page change

  const create = async () => {
    if (!user) return alert('Sign in first.');
    const title = prompt('Inventory title?');
    if (!title) return;
    await createInventory({ owner_id: user.id, title, is_public: true, tags: [] });
    setPage(1);
    load();
  };

  return (
    <div className="container py-4">
      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="Search title/description…" value={q} onChange={e=>setQ(e.target.value)} />
        <input className="form-control" placeholder="Tag (exact)" value={tag} onChange={e=>setTag(e.target.value)} />
        <button className="btn btn-primary" onClick={()=>{ setPage(1); load(); }}>Search</button>
        <button className="btn btn-success ms-auto" onClick={create}>+ New</button>
      </div>

      <div className="list-group mb-3">
        {(list.data || []).map(inv => (
          <Link to={`/inventories/${inv.id}`} className="list-group-item list-group-item-action" key={inv.id}>
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">{inv.title}</h5>
              <small className="text-muted">{new Date(inv.createdAt).toLocaleString()}</small>
            </div>
            <p className="mb-1 small">{inv.description_md?.slice(0, 120)}</p>
            <small className="text-muted">{(inv.Tags || []).map(t => t.name).join(', ')}</small>
          </Link>
        ))}
      </div>

      <div className="d-flex justify-content-end">
        <Pagination page={page} total={list.total || (list.data?.length || 0)} pageSize={pageSize} onChange={setPage} />
      </div>
    </div>
  );
}

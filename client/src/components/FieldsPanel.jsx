import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

const TYPES = [
  { key:'text', label:'Single line' },
  { key:'multiline', label:'Multi line' },
  { key:'number', label:'Numeric' },
  { key:'link', label:'Link' },
  { key:'boolean', label:'Boolean' },
];

export default function FieldsPanel({ inventoryId }) {
  const { push } = useToast();
  const [fields, setFields] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const load = () => api.get(`/inventories/${inventoryId}/fields`).then(r=>setFields(r.data));

  useEffect(() => { load(); }, [inventoryId]);

  const counts = useMemo(() => {
    const c = { text:0, multiline:0, number:0, link:0, boolean:0 };
    fields.forEach(f => c[f.type]++);
    return c;
  }, [fields]);

  const canAdd = counts[type] < 3;

  const addField = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/inventories/${inventoryId}/fields`, { name, type });
      setName(''); setType('text');
      push('Field added');
      load();
    } catch (e) {
      push(e?.response?.data?.error || 'Failed to add field', 'danger');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this field? Values will be removed for all items.')) return;
    await api.delete(`/inventories/${inventoryId}/fields/${id}`);
    load();
  };

  const move = async (id, dir) => {
    // simple client reindex then persist each changed order_index
    const idx = fields.findIndex(f => f.id === id);
    const j = idx + (dir === 'up' ? -1 : 1);
    if (j < 0 || j >= fields.length) return;
    const swapped = [...fields];
    const tmp = swapped[idx]; swapped[idx] = swapped[j]; swapped[j] = tmp;
    // assign order_index 1..n
    const payloads = swapped.map((f, i) => ({ id:f.id, order_index:i+1 }));
    setFields(swapped);
    // persist just the two we changed
    await Promise.all([payloads[idx], payloads[j]].map(p =>
      api.patch(`/inventories/${inventoryId}/fields/${p.id}`, { order_index:p.order_index })
    ));
  };

  return (
    <div className="row g-3">
      <div className="col-md-5">
        <form onSubmit={addField} className="card">
          <div className="card-body">
            <h6 className="card-title">Add field</h6>
            <div className="mb-2">
              <label className="form-label">Label</label>
              <input className="form-control" value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Type</label>
              <select className="form-select" value={type} onChange={e=>setType(e.target.value)}>
                {TYPES.map(t => (
                  <option key={t.key} value={t.key} disabled={counts[t.key] >= 3}>
                    {t.label} {counts[t.key] ? `(${counts[t.key]}/3)` : ''}
                  </option>
                ))}
              </select>
              {!canAdd && <div className="text-danger small mt-1">Maximum 3 fields of this type.</div>}
            </div>
            <button className="btn btn-primary" disabled={!canAdd || !name.trim()}>Add</button>
          </div>
        </form>
      </div>

      <div className="col-md-7">
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">Fields</h6>
            {!fields.length && <div className="text-muted small">No custom fields yet.</div>}
            <ul className="list-group">
              {fields.map((f, i) => (
                <li key={f.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    <strong>{f.name}</strong>
                    <span className="text-muted small ms-2">{f.type}</span>
                  </span>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-secondary" disabled={i===0} onClick={()=>move(f.id,'up')}>↑</button>
                    <button className="btn btn-sm btn-outline-secondary" disabled={i===fields.length-1} onClick={()=>move(f.id,'down')}>↓</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(f.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function ItemFormModal({ inventoryId, onSubmit, onClose }) {
  const [customId, setCustomId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({}); // { fieldId: value }

  useEffect(() => {
    api.get(`/inventories/${inventoryId}/fields`).then(r => setFields(r.data));
  }, [inventoryId]);

  const setVal = (id, v) => setValues(prev => ({ ...prev, [id]: v }));

  const submit = (e) => {
    e.preventDefault();
    const field_values = Object.entries(values).map(([field_id, value]) => ({
      field_id: Number(field_id), value
    }));
    onSubmit({ custom_id: customId, quantity, field_values });
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background:'rgba(0,0,0,.4)' }}>
      <div className="modal-dialog"><div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">New Item</h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Custom ID</label>
              <input className="form-control" value={customId} onChange={e=>setCustomId(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Quantity</label>
              <input type="number" min="1" className="form-control" value={quantity} onChange={e=>setQuantity(Number(e.target.value))} required />
            </div>

            {!!fields.length && <hr />}
            {fields.map(f => (
              <div className="mb-3" key={f.id}>
                <label className="form-label">{f.name}</label>
                {f.type === 'text' && (
                  <input className="form-control" value={values[f.id] || ''} onChange={e=>setVal(f.id, e.target.value)} />
                )}
                {f.type === 'multiline' && (
                  <textarea className="form-control" rows={3} value={values[f.id] || ''} onChange={e=>setVal(f.id, e.target.value)} />
                )}
                {f.type === 'number' && (
                  <input type="number" className="form-control" value={values[f.id] ?? ''} onChange={e=>setVal(f.id, e.target.value)} />
                )}
                {f.type === 'link' && (
                  <input type="url" className="form-control" placeholder="https://…" value={values[f.id] || ''} onChange={e=>setVal(f.id, e.target.value)} />
                )}
                {f.type === 'boolean' && (
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id={`f-${f.id}`} checked={!!values[f.id]} onChange={e=>setVal(f.id, e.target.checked)} />
                    <label htmlFor={`f-${f.id}`} className="form-check-label">Yes</label>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" type="submit">Create</button>
          </div>
        </form>
      </div></div>
    </div>
  );
}

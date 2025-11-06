// components/TagInput.jsx
import { useEffect, useState } from 'react';
export default function TagInput({ value=[], onChange, suggestions=[] }) {
  const [q, setQ] = useState('');
  const filtered = suggestions.filter(s => s.toLowerCase().includes(q.toLowerCase()) && !value.includes(s)).slice(0,5);
  const add = (t) => { onChange([...value, t]); setQ(''); };
  const remove = (t) => onChange(value.filter(x=>x!==t));
  return (
    <div>
      <div className="mb-2 d-flex flex-wrap gap-2">
        {value.map(t=>(
          <span key={t} className="badge text-bg-primary">
            {t} <button className="btn-close btn-close-white ms-1" onClick={()=>remove(t)} />
          </span>
        ))}
      </div>
      <input className="form-control" value={q} onChange={e=>setQ(e.target.value)} placeholder="Add tag…" />
      {!!q && !!filtered.length && (
        <div className="list-group position-absolute">
          {filtered.map(t=>(
            <button key={t} className="list-group-item list-group-item-action" onClick={()=>add(t)}>{t}</button>
          ))}
        </div>
      )}
    </div>
  );
}

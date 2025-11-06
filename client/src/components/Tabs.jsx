// components/Tabs.jsx
export default function Tabs({ tabs, active, onChange }) {
  return (
    <>
      <ul className="nav nav-tabs mb-3">
        {tabs.map(t => (
          <li className="nav-item" key={t.key}>
            <button
              className={`nav-link ${active===t.key?'active':''}`}
              onClick={()=>onChange(t.key)}
            >{t.label}</button>
          </li>
        ))}
      </ul>
    </>
  );
}

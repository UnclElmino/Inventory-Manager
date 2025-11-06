export default function Pagination({ page, total, pageSize, onChange }) {
  const pages = Math.max(1, Math.ceil((total || 0) / pageSize));
  if (pages <= 1) return null;

  const go = p => () => onChange(Math.min(Math.max(1, p), pages));

  return (
    <nav>
      <ul className="pagination mb-0">
        <li className={`page-item ${page<=1?'disabled':''}`}><button className="page-link" onClick={go(page-1)}>Prev</button></li>
        <li className="page-item disabled"><span className="page-link">{page} / {pages}</span></li>
        <li className={`page-item ${page>=pages?'disabled':''}`}><button className="page-link" onClick={go(page+1)}>Next</button></li>
      </ul>
    </nav>
  );
}

import { useEffect, useState } from 'react';
import { fetchLatest, fetchTop5 } from '../lib/invApi';
import { Link } from 'react-router-dom';

export default function Home() {
    const [latest, setLatest] = useState([]);
    const [top, setTop] = useState([]);

    useEffect(() => {
        fetchLatest().then(setLatest).catch(console.error);
        fetchTop5().then(setTop).catch(console.error);
    }, []);

    return (
        <div className="container py-4">
            <h2 className="h5 mb-3">Latest Inventories</h2>
            <div className="row g-3 mb-4">
                {latest.map(inv => (
                    <div className="col-12 col-md-6 col-lg-4" key={inv.id}>
                        <div className="card h-100">
                            {inv.image_url && <img src={inv.image_url} className="card-img-top" alt="cover" />}
                            <div className="card-body">
                                <h5 className="card-title">{inv.title}</h5>
                                <p className="card-text small text-muted mb-1">{inv.category}</p>
                                <Link to={`/inventories/${inv.id}`} className="btn btn-sm btn-outline-primary">Open</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="h5 mb-3">Top 5 (by likes)</h2>
            <ul className="list-group">
                {top.map(inv => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={inv.id}>
                        <span>{inv.title}</span>
                        <span className="badge text-bg-success">{inv.likeCount ?? 0}</span>
                    </li>
                ))}
            </ul>
            <h2 className="h5 mt-4 mb-3">Top 5 Tags</h2>
            <div className="d-flex flex-wrap">
                {['electronics', 'books', 'tools', 'games', 'vintage'].map(t => (
                    <button key={t} className="btn btn-sm btn-outline-secondary me-2 mb-2">{t}</button>
                ))}
            </div>
        </div>
    );
}

import { useEffect, useRef, useState } from 'react';
import { fetchDiscussion, createDiscussionPost } from '../lib/invApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Discussion({ inventoryId }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [posts, setPosts] = useState([]);
  const [body, setBody] = useState('');
  const timerRef = useRef(null);

  const load = () => {
    fetchDiscussion(inventoryId)
      .then(setPosts)
      .catch(() => {/* ignore for now */});
  };

  useEffect(() => {
    load();
    // 3s poll to meet 2–5s update requirement
    timerRef.current = setInterval(load, 3000);
    return () => clearInterval(timerRef.current);
  }, [inventoryId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return push('Sign in first to comment', 'warning');
    if (!body.trim()) return;

    try {
      // if backend needs user_id for now:
      await createDiscussionPost(inventoryId, body, user.id);
      setBody('');
      load();
    } catch (err) {
      push('Failed to post', 'danger');
    }
  };

  return (
    <div>
      <form className="d-flex gap-2 mb-3" onSubmit={onSubmit}>
        <input
          className="form-control"
          placeholder="Write a message…"
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <button className="btn btn-primary">Post</button>
      </form>

      <div className="list-group">
        {posts.map(p => (
          <div key={p.id} className="list-group-item">
            <div className="small text-muted mb-1">
              {p.User?.name || 'User'} • {new Date(p.createdAt).toLocaleString()}
            </div>
            <div>{p.body_md}</div>
          </div>
        ))}
        {!posts.length && <div className="text-muted small">No messages yet.</div>}
      </div>
    </div>
  );
}

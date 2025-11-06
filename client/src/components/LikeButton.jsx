import { useState } from 'react';
import { likeItem, unlikeItem } from '../lib/itemApi';
import { useAuth } from '../context/AuthContext';

export default function LikeButton({ itemId, initialLiked=false }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);

  const toggle = async () => {
    if (!user) return alert('Please sign in first.');
    try {
      if (liked) { await unlikeItem(itemId, user.id); setLiked(false); }
      else { await likeItem(itemId, user.id); setLiked(true); }
    } catch (e) { console.error(e); }
  };

  return (
    <button className={`btn btn-sm ${liked?'btn-success':'btn-outline-success'}`} onClick={toggle}>
      {liked ? 'Liked' : 'Like'}
    </button>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

export default function MovieComments({ movieId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const user = useCurrentUser && useCurrentUser();

  useEffect(() => {
    fetch(`/api/movies/${movieId}/comments`)
      .then(res => res.json())
      .then(setComments);
  }, [movieId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setMessage('Bạn cần đăng nhập để bình luận!');
      return;
    }
    const res = await fetch(`/api/movies/${movieId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: user._id, content, rating }),
    });
    if (res.ok) {
      setMessage('Bình luận thành công!');
      setContent('');
      setRating(5);
      // Reload comments
      fetch(`/api/movies/${movieId}/comments`)
        .then(res => res.json())
        .then(setComments);
    } else {
      setMessage('Có lỗi xảy ra!');
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">Bình luận & Đánh giá</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        <textarea className="textarea textarea-bordered" placeholder="Nhập bình luận..." value={content} onChange={e => setContent(e.target.value)} required />
        <div className="flex items-center gap-2">
          <span>Đánh giá:</span>
          <input type="number" min={1} max={5} className="input input-bordered w-20" value={rating} onChange={e => setRating(Number(e.target.value))} required />
        </div>
        <button className="btn btn-primary" type="submit">Gửi</button>
      </form>
      {message && <div className="text-info mb-2">{message}</div>}
      <div>
        {comments.map((c, idx) => (
          <div key={idx} className="mb-2 p-2 bg-base-200 rounded">
            <div className="font-semibold">{c.user?.name || 'Ẩn danh'} - <span className="text-yellow-400">{'★'.repeat(c.rating)}</span></div>
            <div>{c.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 
'use client';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

// Thêm component StarRating
function StarRating({ value, onChange, readOnly }) {
  const [hover, setHover] = useState(null);
  return (
    <div className="flex items-center">
      {[1,2,3,4,5].map((star, i) => {
        const current = hover !== null ? hover : value;
        // Nếu value = 0 (chưa đánh giá), luôn hiển thị 5 sao viền xám
        const fillColor = value === 0 ? '#e5e7eb' : (star <= current ? '#facc15' : (star - 0.5 === current ? `url(#half-gradient-${i})` : '#e5e7eb'));
        return (
          <span key={i} className={readOnly ? '' : 'relative cursor-pointer select-none'} style={{ fontSize: 28, width: 28, height: 28, display: 'inline-block' }}>
            {!readOnly && (
              <>
                {/* Nửa trái */}
                <span
                  onMouseEnter={() => setHover(star - 0.5)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onChange(star - 0.5)}
                  style={{ position: 'absolute', left: 0, width: '50%', height: '100%', zIndex: 2, top: 0 }}
                />
                {/* Nửa phải */}
                <span
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onChange(star)}
                  style={{ position: 'absolute', right: 0, width: '50%', height: '100%', zIndex: 2, top: 0 }}
                />
              </>
            )}
            {/* Icon sao (SVG) */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              style={{ display: 'block', position: 'relative', zIndex: 1 }}
            >
              <defs>
                <linearGradient id={`half-gradient-${i}`}>
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="50%" stopColor="#e5e7eb" />
                </linearGradient>
              </defs>
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill={fillColor}
                stroke="#e5e7eb"
                strokeWidth="1.5"
              />
            </svg>
          </span>
        );
      })}
    </div>
  );
}

export default function MovieComments({ movieId, readOnly = false }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0); // rating user đang chọn
  const [ratingAverage, setRatingAverage] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const { user, loading } = useCurrentUser();

  // Lấy rating trung bình và count từ API
  useEffect(() => {
    fetch(`/api/movies/${movieId}/rate`)
      .then(res => res.json())
      .then(data => {
        setRatingAverage(data.rating_average || 0);
        setRatingCount(data.rating_count || 0);
      });
    fetch(`/api/movies/${movieId}/comments`)
      .then(res => res.json())
      .then(setComments);
    // Lấy rating user đã chọn từ localStorage
    const saved = localStorage.getItem(`movie-rating-${movieId}`);
    if (saved) setRating(Number(saved));
  }, [movieId]);

  // Khi user chọn rating mới
  async function handleRate(newRating) {
    if (!user || !user.id) {
      setMessage('Bạn cần đăng nhập để đánh giá!');
      return;
    }
    const oldRating = localStorage.getItem(`movie-rating-${movieId}`);
    setRating(newRating);
    localStorage.setItem(`movie-rating-${movieId}`, newRating);
    const res = await fetch(`/api/movies/${movieId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: newRating, oldRating: oldRating ? Number(oldRating) : undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      setRatingAverage(data.rating_average);
      setRatingCount(data.rating_count);
    } else {
      setMessage('Có lỗi khi gửi đánh giá!');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !user.id) {
      setMessage('Bạn cần đăng nhập để bình luận!');
      return;
    }
    if (!content || content.trim() === '') {
      setMessage('Bạn cần nhập bình luận!');
      return;
    }
    const res = await fetch(`/api/movies/${movieId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: user.id, content: content.trim() }),
    });
    if (res.ok) {
      setMessage('Gửi thành công!');
      setContent('');
      setTimeout(() => setMessage(''), 3000);
      // Reload comments
      fetch(`/api/movies/${movieId}/comments`)
        .then(res => res.json())
        .then(setComments);
    } else {
      setMessage('Có lỗi xảy ra!');
    }
  }

  return (
    <div className="relative z-10 mt-24 w-full max-w-3xl mx-auto px-4 ">
      <h3 className="text-lg font-bold mb-2">Comment & Rating</h3>
      {/* Hiển thị rating trung bình */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
        {ratingAverage ? (
          <>
            <span className="text-yellow-400 text-xl font-bold">
              <StarRating value={ratingAverage} readOnly />
            </span>
            <span className="text-yellow-400 font-bold text-lg">
              {ratingAverage}/5 ({ratingCount} {ratingCount <= 1 ? 'rating' : 'ratings'})
            </span>
            <span className="text-gray-400">
              ({comments.length} {comments.length <= 1 ? 'comment' : 'comments'})
            </span>
          </>
        ) : (
          <span className="text-yellow-400 text-xl font-bold">
            Not having rating{' '}
            <span className="text-gray-400">
              ({comments.length} {comments.length <= 1 ? 'comment' : 'comments'})
            </span>
          </span>
        )}
      </div>
      {/* Nếu không phải readOnly thì mới cho nhập rating và bình luận */}
      {!readOnly && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <span>Rating:</span>
            <StarRating value={rating} onChange={handleRate} />
            <span className="text-yellow-500 font-bold">{rating}/5</span>
          </div>
          <div className="flex flex-col sm:flex-row w-full items-stretch gap-2">
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Typing your comment..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
            <button
              className="btn btn-primary sm:w-auto whitespace-nowrap"
              type="submit"
            >
              Send
            </button>
          </div>
        </form>
      )}
      {message && <div className="text-info mb-2">{message}</div>}
      <div>
        {comments.map((c, idx) => (
          <div key={idx} className="mb-2 p-2 bg-base-200 rounded">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 font-semibold">
              <span>{c.user_id?.username || 'Ẩn danh'}</span>
              {c.content && (
                <span className="text-white font-normal sm:ml-2">{c.content}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
} 
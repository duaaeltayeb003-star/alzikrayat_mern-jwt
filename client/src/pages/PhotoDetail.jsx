import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CommentForm from '../components/CommentForm.jsx';
import { ErrorState, Loading } from '../components/Feedback.jsx';
import useFetch from '../utils/useFetch.js';
import { api, imageUrl } from '../utils/api.js';
import { formatDateTime, fullName } from '../utils/format.js';

export default function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const photoReq = useFetch(`/photos/${id}`);
  const commentsReq = useFetch(`/photos/${id}/comments`);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (photoReq.loading) return <div className="wrap section"><Loading label="Loading photo…" /></div>;
  if (photoReq.error) {
    return (
      <div className="wrap section">
        <ErrorState message={photoReq.error} onRetry={photoReq.reload} />
        <p><Link to="/gallery">Back to the gallery</Link></p>
      </div>
    );
  }

  const photo = photoReq.data;
  const comments = commentsReq.data || [];
  const isOwner = user && photo.userId && photo.userId._id === user._id;

  // Posts the comment, then adds it to the list straight away (no page reload)
  const addComment = async (text) => {
    const created = await api.post(`/photos/${id}/comments`, { comment: text });
    commentsReq.setData((list) => [...(list || []), created]);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this photo and its comments? This cannot be undone.')) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/photos/${id}`);
      navigate('/gallery');
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="wrap section">
      <p className="crumb"><Link to="/gallery">Back to the gallery</Link></p>

      <div className="detail">
        <div className="mount-wrap detail-photo">
          <div className="mount">
            <div className="aperture aperture-detail">
              <img src={imageUrl(photo.fileName)} alt={photo.title} />
            </div>
          </div>
        </div>

        <div className="detail-side">
          <h1>{photo.title}</h1>
          <p className="meta">
            Shared by {fullName(photo.userId)} on {formatDateTime(photo.dateTime)}
          </p>
          {photo.description && <p className="story">{photo.description}</p>}

          {isOwner && (
            <div className="owner-actions">
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete photo'}
              </button>
              {deleteError && <p className="alert alert-error" role="alert">{deleteError}</p>}
            </div>
          )}

          <section className="comments" aria-labelledby="comments-title">
            <h2 id="comments-title">
              {comments.length === 1 ? '1 comment' : `${comments.length} comments`}
            </h2>

            {user ? (
              <CommentForm onSubmit={addComment} />
            ) : (
              <p className="login-prompt">
                <Link to="/login" state={{ from: { pathname: `/photos/${id}` } }}>Log in</Link> to
                add a comment.
              </p>
            )}

            {commentsReq.loading && <Loading label="Loading comments…" />}
            {commentsReq.error && <ErrorState message={commentsReq.error} onRetry={commentsReq.reload} />}
            {!commentsReq.loading && !commentsReq.error && comments.length === 0 && (
              <p className="status">No comments yet. Start the conversation.</p>
            )}

            <ul className="comment-list">
              {comments.map((c) => (
                <li key={c._id} className="comment">
                  <div className="comment-head">
                    <strong>{fullName(c.userId)}</strong>
                    <time dateTime={c.dateTime}>{formatDateTime(c.dateTime)}</time>
                  </div>
                  <p>{c.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

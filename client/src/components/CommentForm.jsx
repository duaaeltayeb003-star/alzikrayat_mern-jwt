import { useState } from 'react';

const MAX_LENGTH = 500;

// Controlled form. The parent decides what "submit" does and returns a promise.
export default function CommentForm({ onSubmit }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Write something before posting.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await onSubmit(trimmed);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form" noValidate>
      <label htmlFor="comment-text" className="label">
        Add a comment
      </label>
      <textarea
        id="comment-text"
        rows="3"
        maxLength={MAX_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What does this photo bring back?"
      />
      <div className="form-row">
        <span className="hint">
          {text.length}/{MAX_LENGTH}
        </span>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? 'Posting…' : 'Post comment'}
        </button>
      </div>
      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

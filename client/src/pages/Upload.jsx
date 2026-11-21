import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Show a preview of the chosen file, and free the temporary URL afterwards
  useEffect(() => {
    if (!file) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  const handleFile = (e) => {
    const chosen = e.target.files[0];
    setError('');
    if (!chosen) return setFile(null);
    if (!ALLOWED.includes(chosen.type)) {
      setFile(null);
      return setError('Choose a JPG, PNG, GIF or WEBP image.');
    }
    if (chosen.size > MAX_BYTES) {
      setFile(null);
      return setError('The image must be 5 MB or smaller.');
    }
    setFile(chosen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Choose an image to upload.');
    if (!title.trim()) return setError('Give your photo a title.');

    const form = new FormData();
    form.append('title', title.trim());
    form.append('description', description.trim());
    form.append('image', file);

    setBusy(true);
    setError('');
    try {
      const photo = await api.upload('/photos', form);
      navigate(`/photos/${photo._id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="wrap section upload">
      <div className="page-head">
        <h1>Add a photo</h1>
        <p className="lead">Share a moment and the story behind it.</p>
      </div>

      <form className="panel cut upload-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="image">Image</label>
          <input id="image" type="file" accept={ALLOWED.join(',')} onChange={handleFile} />
          <p className="hint">JPG, PNG, GIF or WEBP, up to 5 MB.</p>
        </div>

        {preview && (
          <div className="mount-wrap preview">
            <div className="mount">
              <div className="aperture aperture-detail">
                <img src={preview} alt="Preview of the chosen file" />
              </div>
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="description">Story (optional)</label>
          <textarea id="description" rows="4" maxLength={1000} value={description}
            onChange={(e) => setDescription(e.target.value)} />
        </div>

        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Uploading…' : 'Upload photo'}
        </button>
      </form>
    </div>
  );
}

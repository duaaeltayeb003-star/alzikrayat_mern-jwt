import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PhotoCard from '../components/PhotoCard.jsx';
import { ErrorState, GridSkeleton } from '../components/Feedback.jsx';
import useFetch from '../utils/useFetch.js';

const VIEW_KEY = 'alzikrayat_view';

export default function Gallery() {
  const { user } = useAuth();
  const { data: photos, loading, error, reload } = useFetch('/photos');
  const [query, setQuery] = useState('');
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });

  const changeView = (next) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return photos || [];
    return (photos || []).filter((p) => p.title.toLowerCase().includes(q));
  }, [photos, query]);

  return (
    <div className="wrap section">
      <div className="page-head">
        <h1>Gallery</h1>
        <p className="lead">Photos shared by everyone on Alzikrayat, newest first.</p>
      </div>

      <div className="toolbar">
        <div className="search">
          <label htmlFor="search" className="visually-hidden">
            Search photos by title
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search by title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="segmented" role="group" aria-label="Layout">
          <button type="button" aria-pressed={view === 'grid'} onClick={() => changeView('grid')}>
            Grid
          </button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => changeView('list')}>
            List
          </button>
        </div>
      </div>

      {loading && <GridSkeleton />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && photos && photos.length === 0 && (
        <div className="empty">
          <h2>No photos yet</h2>
          <p>The gallery is waiting for its first memory.</p>
          <Link to={user ? '/upload' : '/login'} className="btn btn-primary">
            {user ? 'Add the first photo' : 'Log in to add a photo'}
          </Link>
        </div>
      )}

      {!loading && !error && photos && photos.length > 0 && visible.length === 0 && (
        <p className="status">No photos match “{query}”. Try a different word.</p>
      )}

      {visible.length > 0 && (
        <div className={view === 'list' ? 'photo-list' : 'photo-grid'}>
          {visible.map((photo) => (
            <PhotoCard key={photo._id} photo={photo} view={view} />
          ))}
        </div>
      )}
    </div>
  );
}

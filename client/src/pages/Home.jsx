import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useFetch from '../utils/useFetch.js';
import { imageUrl } from '../utils/api.js';

export default function Home() {
  const { user } = useAuth();
  const { data: photos } = useFetch('/photos');
  const { data: stats } = useFetch('/stats');

  // The three newest photos are laid out on the "light table"
  const latest = (photos || []).slice(0, 3);
  const slots = [0, 1, 2];

  return (
    <>
      <section className="hero wrap">
        <div className="hero-text">
          <h1>Every moment on campus, kept in one place.</h1>
          <p className="lead">
            Alzikrayat is where students share photos from campus life, tell the story behind each
            one, and talk about it together.
          </p>
          <div className="hero-actions">
            <Link to="/gallery" className="btn btn-primary">
              Browse the gallery
            </Link>
            {user ? (
              <Link to="/upload" className="btn btn-secondary">
                Add a photo
              </Link>
            ) : (
              <Link to="/login" className="btn btn-secondary">
                Create an account
              </Link>
            )}
          </div>
          {stats && (
            <p className="tally">
              So far: <strong>{stats.photos}</strong> {stats.photos === 1 ? 'photo' : 'photos'} from{' '}
              <strong>{stats.users}</strong> {stats.users === 1 ? 'member' : 'members'}, with{' '}
              <strong>{stats.comments}</strong> {stats.comments === 1 ? 'comment' : 'comments'}.
            </p>
          )}
        </div>

        <div className="light-table" aria-label="Latest photos">
          {slots.map((i) => {
            const photo = latest[i];
            return (
              <div key={i} className={`mount-wrap lt lt-${i + 1}`}>
                {photo ? (
                  <Link to={`/photos/${photo._id}`} className="mount">
                    <div className="aperture">
                      <img src={imageUrl(photo.fileName)} alt={photo.title} />
                    </div>
                    <div className="mount-caption">
                      <h3>{photo.title}</h3>
                    </div>
                  </Link>
                ) : (
                  <div className="mount">
                    <div className="aperture aperture-empty" />
                    <div className="mount-caption">
                      <h3 className="muted">{i === 0 ? 'Your photo could be first' : 'Waiting for a photo'}</h3>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="wrap section">
        <div className="steps">
          <div className="step">
            <h2>Share a photo</h2>
            <p>Upload a picture, give it a title, and add the story behind it.</p>
          </div>
          <div className="step">
            <h2>Join the conversation</h2>
            <p>Open any photo to read what others remember and add your own comment.</p>
          </div>
          <div className="step">
            <h2>Stay in charge</h2>
            <p>Anyone can view the gallery, but only you can delete the photos you shared.</p>
          </div>
        </div>
      </section>
    </>
  );
}

import { Link } from 'react-router-dom';
import { formatDate, fullName } from '../utils/format.js';
import { imageUrl } from '../utils/api.js';

// One photo shown in a slide mount. `view` is "grid" or "list".
export default function PhotoCard({ photo, view = 'grid' }) {
  const count = photo.commentCount || 0;

  return (
    <article className={`mount-wrap mount-${view}`}>
      <Link to={`/photos/${photo._id}`} className="mount">
        <div className="aperture">
          <img src={imageUrl(photo.fileName)} alt={photo.title} loading="lazy" />
        </div>
        <div className="mount-caption">
          <h3>{photo.title}</h3>
          {view === 'list' && photo.description && <p className="mount-desc">{photo.description}</p>}
          <p className="mount-meta">
            {fullName(photo.userId)}, {formatDate(photo.dateTime)}
          </p>
          <p className="mount-meta">
            {count === 1 ? '1 comment' : `${count} comments`}
          </p>
        </div>
      </Link>
    </article>
  );
}

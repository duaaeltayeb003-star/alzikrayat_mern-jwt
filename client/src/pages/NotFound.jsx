import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="wrap section empty">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or was moved.</p>
      <Link to="/" className="btn btn-primary">Go to the home page</Link>
    </div>
  );
}

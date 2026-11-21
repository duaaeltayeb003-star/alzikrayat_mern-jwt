// Shared loading and error states so every page behaves the same way

export function Loading({ label = 'Loading…' }) {
  return (
    <p className="status" role="status">
      {label}
    </p>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="photo-grid" role="status" aria-label="Loading photos">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="alert alert-error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

interface PageLoaderProps {
  isVisible: boolean;
  message?: string;
}

export function PageLoader({
  isVisible,
  message = "Loading",
}: PageLoaderProps) {
  return (
    <div
      aria-hidden={!isVisible}
      aria-label={message}
      className={`page-loader${isVisible ? " page-loader--visible" : ""}`}
      role="status"
    >
      <span className="page-loader-spinner" />
      <span className="page-loader-message">{message}</span>
    </div>
  );
}

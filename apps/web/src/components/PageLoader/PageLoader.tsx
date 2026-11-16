import styles from "./PageLoader.module.css";

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
      className={`${styles.loader}${isVisible ? ` ${styles.visible}` : ""}`}
      role="status"
    >
      <span className={styles.spinner} />
      <span className={styles.message}>{message}</span>
    </div>
  );
}

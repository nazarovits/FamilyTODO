import { RouterProvider } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { PageLoader } from "./components/PageLoader";
import { router } from "./routes/routes";
import styles from "./styles/AuthPage.module.css";

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { status, retrySession } = useAuth();

  if (status === "loading") {
    return <PageLoader isVisible message="Checking your session" />;
  }

  if (status === "error") {
    return (
      <main className={styles.page}>
        <section className={styles.panel} aria-labelledby="session-error-title">
          <h1 className={styles.brand}>FamilyTODO</h1>
          <h2 className={styles.title} id="session-error-title">
            Unable to restore your session
          </h2>
          <p className={styles.description}>
            We couldn’t verify your session. Please try again.
          </p>
          <button className={styles.submit} onClick={retrySession} type="button">
            Try again
          </button>
        </section>
      </main>
    );
  }

  return <RouterProvider router={router} />;
}

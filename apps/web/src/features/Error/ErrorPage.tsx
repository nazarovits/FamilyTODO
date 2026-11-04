import { Link } from "react-router-dom";
import { AppRoute } from "../../routes/AppRoute";

export function ErrorPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="error-title">
        <h1 className="auth-brand">FamilyTODO</h1>
        <h2 className="auth-title" id="error-title">
          Something went wrong
        </h2>
        <p className="auth-description">
          We couldn&apos;t complete your request. Please try again later.
        </p>
        <Link className="auth-back-link" to={AppRoute.Login}>
          Back to login
        </Link>
      </section>
    </main>
  );
}

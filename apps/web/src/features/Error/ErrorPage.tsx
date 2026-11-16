import { Link } from "react-router-dom";
import { AppRoute } from "../../routes/AppRoute";
import styles from "../../styles/AuthPage.module.css";

export function ErrorPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="error-title">
        <h1 className={styles.brand}>FamilyTODO</h1>
        <h2 className={styles.title} id="error-title">
          Something went wrong
        </h2>
        <p className={styles.description}>
          We couldn&apos;t complete your request. Please try again later.
        </p>
        <Link className={styles.backLink} to={AppRoute.Login}>
          Back to login
        </Link>
      </section>
    </main>
  );
}

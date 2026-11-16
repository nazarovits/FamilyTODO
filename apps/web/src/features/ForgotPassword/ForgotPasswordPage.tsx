import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiRequestError } from "../../lib/apiClient";
import { AppRoute } from "../../routes/AppRoute";
import styles from "../../styles/AuthPage.module.css";
import { useForgotPassword } from "./useForgotPassword";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const resetMutation = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");

    if (typeof email !== "string") {
      return;
    }

    resetMutation.mutate(email.trim(), {
      onSuccess: () => setSubmitted(true),
      onError: (error) => {
        if (error instanceof ApiRequestError && error.status >= 500) {
          navigate(AppRoute.Error, { replace: true });
        }
      },
    });
  }

  const errorMessage =
    resetMutation.error instanceof ApiRequestError
      ? "Please check the email address and try again."
      : resetMutation.error
        ? "Unable to connect. Please try again."
        : null;

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="forgot-password-title">
        <h1 className={styles.brand}>FamilyTODO</h1>
        <h2 className={styles.title} id="forgot-password-title">
          Forgot your password?
        </h2>
        {submitted ? (
          <>
            <p className={styles.success} role="status">
              If an account matches that email address, we&apos;ll send
              instructions to reset its password. Check your inbox and spam
              folder.
            </p>
            <Link className={styles.backLink} to={AppRoute.Login}>
              Back to login
            </Link>
          </>
        ) : (
          <>
            <p className={styles.description}>
              Enter the email address associated with your account and we&apos;ll
              send password reset instructions if an account matches.
            </p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="forgot-email">Email</label>
                <input
                  autoComplete="email"
                  id="forgot-email"
                  name="email"
                  onChange={() => resetMutation.reset()}
                  required
                  type="email"
                />
              </div>
              {errorMessage && (
                <p className={styles.error} role="alert">
                  {errorMessage}
                </p>
              )}
              <button
                className={styles.submit}
                disabled={resetMutation.isPending}
                type="submit"
              >
                {resetMutation.isPending ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <Link className={styles.backLink} to={AppRoute.Login}>
              Back to login
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

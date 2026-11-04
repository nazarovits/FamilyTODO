import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import {
  PASSWORD_MAX_CODE_POINTS,
  PASSWORD_MIN_CODE_POINTS,
  validatePassword,
} from "@familytodo/shared-types";
import { ApiRequestError } from "../../lib/apiClient";
import { AppRoute } from "../../routes/AppRoute";
import { useResetPassword } from "./useResetPassword";

export function resetPasswordLoader(): { token: string | null } {
  const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
  return { token };
}

export function ResetPasswordPage() {
  const { token } = useLoaderData<typeof resetPasswordLoader>();
  const navigate = useNavigate();
  const resetMutation = useResetPassword();
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);

    if (!token) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password");
    const confirmation = formData.get("confirmation");

    if (typeof password !== "string" || typeof confirmation !== "string") {
      return;
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      const messages = {
        "too-short": `Use at least ${PASSWORD_MIN_CODE_POINTS} characters.`,
        "too-long": `Use no more than ${PASSWORD_MAX_CODE_POINTS} characters.`,
        whitespace: "Password cannot contain spaces or other whitespace.",
      };
      setPasswordError(messages[validation.reason]);
      return;
    }
    if (password !== confirmation) {
      setPasswordError("The passwords do not match.");
      return;
    }

    resetMutation.mutate(
      { token, password },
      {
        onSuccess: () => form.reset(),
        onError: (error) => {
          form.reset();
          if (error instanceof ApiRequestError && error.status >= 500) {
            navigate(AppRoute.Error, { replace: true });
          }
        },
      },
    );
  }

  const errorMessage = passwordError
    ? passwordError
    : resetMutation.error instanceof ApiRequestError
      ? "This password reset link is invalid or has expired. Request a new link to continue."
      : resetMutation.error
        ? "Unable to connect. Please try again."
        : null;

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="reset-password-title">
        <h1 className="auth-brand">FamilyTODO</h1>
        <h2 className="auth-title" id="reset-password-title">
          Reset your password
        </h2>
        {!token ? (
          <>
            <p className="auth-error" role="alert">
              This password reset link is invalid or has expired. Request a new
              link to continue.
            </p>
            <Link className="auth-back-link" to={AppRoute.ForgotPassword}>
              Request a new reset link
            </Link>
          </>
        ) : resetMutation.isSuccess ? (
          <>
            <p className="auth-success" role="status">
              Your password has been changed. Sign in with your new password.
            </p>
            <Link className="auth-back-link" to={AppRoute.Login}>
              Go to login
            </Link>
          </>
        ) : (
          <>
            <p className="auth-description">
              Choose a new password. Use {PASSWORD_MIN_CODE_POINTS}–
              {PASSWORD_MAX_CODE_POINTS} characters with no spaces or other
              whitespace.
            </p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="new-password">New password</label>
                <input
                  autoComplete="new-password"
                  aria-describedby="password-hint"
                  id="new-password"
                  name="password"
                  required
                  type="password"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="confirm-password">Confirm new password</label>
                <input
                  autoComplete="new-password"
                  aria-describedby="password-hint"
                  id="confirm-password"
                  name="confirmation"
                  required
                  type="password"
                />
                <p className="auth-field-hint" id="password-hint">
                  Unicode characters are allowed. Passwords must match.
                </p>
              </div>
              {errorMessage && (
                <p className="auth-error" role="alert">
                  {errorMessage}
                </p>
              )}
              <button
                className="auth-submit"
                disabled={resetMutation.isPending}
                type="submit"
              >
                {resetMutation.isPending
                  ? "Saving..."
                  : "Set new password"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

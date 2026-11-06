import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { ApiRequestError } from "../../lib/apiClient";
import { AppRoute } from "../../routes/AppRoute";
import { useLogin } from "./useLogin";

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (user) => {
          setUser(user);
          navigate(AppRoute.Home, { replace: true });
        },
      },
    );
  }

  const errorMessage =
    loginMutation.error instanceof ApiRequestError
      ? loginMutation.error.message
      : loginMutation.error
        ? "Unable to connect. Please try again."
        : null;

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <h1 className="login-brand">FamilyTODO</h1>
        <h2 className="login-title" id="login-title">
          Sign in to your family
        </h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              autoComplete="email"
              id="email"
              name="email"
              required
              type="email"
              onChange={() => loginMutation.reset()}
            />
          </div>

          <div className="login-field">
            <div className="login-password-label">
              <label htmlFor="password">Password</label>
              <Link to={AppRoute.ForgotPassword}>Forgot password?</Link>
            </div>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              required
              type="password"
              onChange={() => loginMutation.reset()}
            />
          </div>

          {errorMessage && (
            <p className="login-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            className="login-submit"
            disabled={loginMutation.isPending}
            type="submit"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

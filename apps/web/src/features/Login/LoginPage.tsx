export function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <h1 className="login-brand">FamilyTODO</h1>
        <h2 className="login-title" id="login-title">
          Sign in to your family
        </h2>

        <form className="login-form" onSubmit={(event) => event.preventDefault()}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              autoComplete="email"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>

          <div className="login-field">
            <div className="login-password-label">
              <label htmlFor="password">Password</label>
              <a href="/forgot-password">Forgot password?</a>
            </div>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              required
              type="password"
            />
          </div>

          <button className="login-submit" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}

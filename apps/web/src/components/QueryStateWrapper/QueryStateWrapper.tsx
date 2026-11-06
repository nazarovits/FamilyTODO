import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";
import { ApiRequestError } from "../../lib/apiClient";
import { AppRoute } from "../../routes/AppRoute";
import { PageLoader } from "../PageLoader";

interface QueryStateWrapperProps<TData> {
  query: UseQueryResult<TData, Error>;
  loadingMessage?: string;
  children: (data: TData) => ReactNode;
}

export function QueryStateWrapper<TData>({
  query,
  loadingMessage,
  children,
}: QueryStateWrapperProps<TData>) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { data, error, isFetching, refetch } = query;

  useEffect(() => {
    if (!(error instanceof ApiRequestError)) {
      return;
    }

    if (error.status === 401) {
      setUser(null);
      navigate(AppRoute.Login, { replace: true });
    } else if (error.status >= 500) {
      navigate(AppRoute.Error, { replace: true });
    }
  }, [error, navigate, setUser]);

  const hasRecoverableError =
    error &&
    (!(error instanceof ApiRequestError) ||
      (error.status < 500 && error.status !== 401));

  return (
    <>
      <PageLoader isVisible={isFetching} message={loadingMessage} />
      <section aria-busy={isFetching} className="page-state">
        {data !== undefined && children(data)}
        {hasRecoverableError && (
          <div className="page-state-error" role="alert">
            <p>We couldn&apos;t load this page. Please try again.</p>
            <button
              className="page-state-retry"
              onClick={() => void refetch()}
              type="button"
            >
              Try again
            </button>
          </div>
        )}
      </section>
    </>
  );
}

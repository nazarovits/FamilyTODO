import { QueryStateWrapper } from "../../components/QueryStateWrapper";
import { useDashboard } from "./useDashboard";

export function HomePage() {
  const query = useDashboard();

  return (
    <QueryStateWrapper
      loadingMessage="Loading your dashboard"
      query={query}
    >
      {() => (
        <div className="home-page">
          <h1>Home</h1>
        </div>
      )}
    </QueryStateWrapper>
  );
}

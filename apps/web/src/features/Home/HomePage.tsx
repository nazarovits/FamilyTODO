import { QueryStateWrapper } from "../../components/QueryStateWrapper";
import { useDashboard } from "./useDashboard";
import styles from "./HomePage.module.css";

export function HomePage() {
  const query = useDashboard();

  return (
    <QueryStateWrapper
      loadingMessage="Loading your dashboard"
      query={query}
    >
      {() => (
        <div className={styles.page}>
          <h1>Home</h1>
        </div>
      )}
    </QueryStateWrapper>
  );
}

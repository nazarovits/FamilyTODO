import { Outlet, useMatches } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BottomNavigation } from "../components/BottomNavigation/BottomNavigation";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const { user } = useAuth();
  const hideBottomNavigation = useMatches().some(({ handle }) => {
    return (
      typeof handle === "object" &&
      handle !== null &&
      "hideBottomNav" in handle &&
      handle.hideBottomNav === true
    );
  });
  const showBottomNavigation = user !== null && !hideBottomNavigation;

  return (
    <div
      className={`${styles.layout}${showBottomNavigation ? ` ${styles.withBottomNavigation}` : ""}`}
    >
      <main className={styles.content}>
        <Outlet />
      </main>
      {showBottomNavigation && <BottomNavigation role={user.profile?.role} />}
    </div>
  );
}

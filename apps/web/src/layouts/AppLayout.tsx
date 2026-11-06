import { Outlet, useMatches } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BottomNavigation } from "../components/BottomNavigation/BottomNavigation";

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
      className={`app-layout${showBottomNavigation ? " app-layout--with-nav" : ""}`}
    >
      <main className="app-content">
        <Outlet />
      </main>
      {showBottomNavigation && <BottomNavigation role={user.profile?.role} />}
    </div>
  );
}

import { NavLink } from "react-router-dom";
import { UserRole } from "@familytodo/shared-types";
import { AppRoute } from "../../routes/AppRoute";
import styles from "./BottomNavigation.module.css";

interface BottomNavigationProps {
  role?: UserRole;
}

export function BottomNavigation({ role }: BottomNavigationProps) {
  const links = [
    { label: "Home", to: AppRoute.Home, end: true },
    { label: "Tasks", to: AppRoute.Tasks, end: false },
    ...(role === UserRole.Parent
      ? [{ label: "Activity", to: AppRoute.Activity, end: false }]
      : []),
    { label: "Profile", to: AppRoute.Profile, end: false },
  ];

  return (
    <nav className={styles.navigation} aria-label="Main navigation">
      {links.map(({ label, to, end }) => (
        <NavLink
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
          end={end}
          key={to}
          to={to}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

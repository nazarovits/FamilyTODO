import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@familytodo/shared-types";
import { useAuth } from "../../auth/AuthContext";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { post } from "../../lib/apiClient";
import { AppRoute } from "../../routes/AppRoute";
import styles from "./ProfilePage.module.css";

const sampleProfile = {
  displayName: "Alex Morgan",
  email: "alex@example.com",
  role: UserRole.Parent,
};

const samplePointsHistory = [
  { description: "Clean Room", points: 20 },
  { description: "Feed Cat", points: 10 },
  { description: "Chocolate", points: -15 },
];

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const displayName = user?.profile?.displayName || sampleProfile.displayName;
  const email = user?.email || sampleProfile.email;
  const role = user?.profile?.role ?? sampleProfile.role;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await post("/api/logout");
      setIsConfirmOpen(false);
      setUser(null);
      navigate(AppRoute.Login, { replace: true });
    } catch {
      setLogoutError("We couldn’t log you out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  function closeConfirm() {
    if (isLoggingOut) {
      return;
    }
    setIsConfirmOpen(false);
    setLogoutError(null);
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Profile</h1>

      <section className={styles.header} aria-label="Your profile">
        <div aria-hidden="true" className={styles.avatar}>
          {initials}
        </div>
        <div className={styles.identity}>
          <h2 className={styles.name}>{displayName}</h2>
          <p className={styles.email}>{email}</p>
          <span className={styles.role}>
            {role === UserRole.Parent ? "Parent" : "Child"}
          </span>
        </div>
        <button
          className={styles.logout}
          onClick={() => {
            setLogoutError(null);
            setIsConfirmOpen(true);
          }}
          type="button"
        >
          Log out
        </button>
      </section>

      <div className={styles.details}>
        <section className={styles.card} aria-labelledby="profile-points-title">
          <h2 className={styles.sectionTitle} id="profile-points-title">
            Current points
          </h2>
          <p className={styles.pointsValue}>125 points</p>
        </section>

        <section
          className={styles.card}
          aria-labelledby="profile-history-title"
        >
          <h2 className={styles.sectionTitle} id="profile-history-title">
            Points history
          </h2>
          <ul className={styles.historyList}>
            {samplePointsHistory.map(({ description, points }) => (
              <li className={styles.historyItem} key={description}>
                <span
                  className={`${styles.historyPoints} ${
                    points > 0
                      ? styles.historyPointsPositive
                      : styles.historyPointsNegative
                  }`}
                >
                  {points > 0 ? "+" : ""}
                  {points}
                </span>
                <span>{description}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ConfirmDialog
        errorMessage={logoutError}
        isBusy={isLoggingOut}
        isOpen={isConfirmOpen}
        message="Are you sure you want to log out?"
        onNoPressed={closeConfirm}
        onYesPressed={() => void handleLogout()}
        title="Log out?"
      />
    </div>
  );
}

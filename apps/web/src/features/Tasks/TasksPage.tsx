import { Link } from "react-router-dom";
import { AppRoute } from "../../routes/AppRoute";
import styles from "./TasksPage.module.css";

export function TasksPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.description}>
            Create and assign tasks for your family.
          </p>
        </div>
        <Link className={styles.createButton} to={AppRoute.CreateTask}>
          <span aria-hidden="true">+</span>
          Create task
        </Link>
      </header>
    </div>
  );
}

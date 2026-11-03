import { Link } from "react-router-dom";
import { AppRoute } from "../../routes/AppRoute";

export const MainPage = () => {
  return (
    <main>
      <h1>FamilyTODO</h1>
      <p>Your family task manager starts here.</p>
      <Link to={AppRoute.Login}>Login</Link>
    </main>
  );
};

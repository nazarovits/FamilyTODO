import { AppRoute } from "./AppRoute";
import { createBrowserRouter } from "react-router-dom";

import MainPage from "../features/Main";
import LoginPage from "../features/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: AppRoute.Login,
    element: <LoginPage />,
  },
]);

import { AppRoute } from "./AppRoute";
import { createBrowserRouter } from "react-router-dom";

import MainPage from "../features/Main";
import LoginPage from "../features/Login";
import ForgotPasswordPage from "../features/ForgotPassword";
import ResetPasswordPage, {
  resetPasswordLoader,
} from "../features/ResetPassword";
import ErrorPage from "../features/Error";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: AppRoute.Login,
    element: <LoginPage />,
  },
  {
    path: AppRoute.ForgotPassword,
    element: <ForgotPasswordPage />,
  },
  {
    path: AppRoute.ResetPassword,
    loader: resetPasswordLoader,
    element: <ResetPasswordPage />,
  },
  {
    path: AppRoute.Error,
    element: <ErrorPage />,
  },
]);

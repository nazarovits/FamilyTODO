import { AppRoute } from "./AppRoute";
import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import HomePage from "../features/Home";
import TasksPage from "../features/Tasks";
import ActivityPage from "../features/Activity";
import ProfilePage from "../features/Profile";
import LoginPage from "../features/Login";
import ForgotPasswordPage from "../features/ForgotPassword";
import ResetPasswordPage, {
  resetPasswordLoader,
} from "../features/ResetPassword";
import ErrorPage from "../features/Error";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: AppRoute.Home,
        element: <HomePage />,
      },
      {
        path: AppRoute.Tasks,
        element: <TasksPage />,
      },
      {
        path: AppRoute.Activity,
        element: <ActivityPage />,
      },
      {
        path: AppRoute.Profile,
        element: <ProfilePage />,
      },
    ],
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

import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";

import { ROUTES } from "../constants/route.constants";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },

      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
    ],
  },
];

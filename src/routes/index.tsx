import type { RouteObject } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      //Các route con
    ],
  },
];

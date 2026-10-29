import { useRoutes } from "react-router-dom";
import { routes } from "./index";

function AllRoute() {
  return useRoutes(routes);
}

export default AllRoute;

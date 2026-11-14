import AllRoute from "./routes/AllRoute";
import { PermissionProvider } from "./contexts/PermissionContext";

function App() {
  return (
    <PermissionProvider>
      <AllRoute />
    </PermissionProvider>
  );
}

export default App;

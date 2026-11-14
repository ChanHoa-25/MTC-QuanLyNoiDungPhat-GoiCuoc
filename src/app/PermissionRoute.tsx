import { Navigate, Outlet } from "react-router-dom";
import { Button, Spin, Alert } from "antd";

import { usePermission } from "../contexts/PermissionContext";

interface PermissionRouteProps {
  permission: string;
}

function PermissionRoute({ permission }: PermissionRouteProps) {
  const { loading, error, hasPermission, refreshPermissions } = usePermission();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="error"
          showIcon
          title="Không thể kiểm tra quyền truy cập"
          description={error}
          action={
            <Button onClick={() => void refreshPermissions()}>Thử lại</Button>
          }
        />
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export default PermissionRoute;

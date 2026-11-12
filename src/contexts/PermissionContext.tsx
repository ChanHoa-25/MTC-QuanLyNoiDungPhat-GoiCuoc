import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { authStorage } from "../utils/authStorage";
import { getCurrentUserPermissions } from "../utils/permission";

interface PermissionContextType {
  permissions: string[];
  loading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
  clearPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined,
);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mỗi lần tải hoặc xóa quyền sẽ thay đổi mã yêu cầu.
  const requestIdRef = useRef(0);

  const clearPermissions = useCallback(() => {
    // Vô hiệu hóa kết quả của các yêu cầu đang chạy
    requestIdRef.current += 1;

    setPermissions([]);
    setError(null);
    setLoading(false);
  }, []);

  const refreshPermissions = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const accessToken = authStorage.getAccessToken();

    // Không có token thì xóa quyền
    if (!accessToken) {
      setPermissions([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Xóa quyền cũ ngay khi bắt đầu tải phiên mới
    setPermissions([]);
    setLoading(true);
    setError(null);

    try {
      const result = await getCurrentUserPermissions();

      // Bỏ qua nếu đã có yêu cầu mới hoặc token đã thay đổi
      if (
        requestId !== requestIdRef.current ||
        authStorage.getAccessToken() !== accessToken
      ) {
        return;
      }

      setPermissions(result);
    } catch (err) {
      if (
        requestId !== requestIdRef.current ||
        authStorage.getAccessToken() !== accessToken
      ) {
        return;
      }

      setPermissions([]);
      setError(
        err instanceof Error ? err.message : "Không thể tải quyền truy cập.",
      );
    } finally {
      if (
        requestId === requestIdRef.current &&
        authStorage.getAccessToken() === accessToken
      ) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refreshPermissions();

    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshPermissions]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return !loading && !error && permissions.includes(permission);
    },
    [permissions, loading, error],
  );

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        error,
        hasPermission,
        refreshPermissions,
        clearPermissions,
      }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission(): PermissionContextType {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error(
      "usePermission phải được sử dụng trong PermissionProvider.",
    );
  }

  return context;
}

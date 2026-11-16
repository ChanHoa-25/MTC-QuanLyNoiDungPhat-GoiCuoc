import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { LogOut } from "lucide-react";

import { ROUTES } from "../../constants/route.constants";
import { authApi } from "../../api/authApi";
import type { AuthUser } from "../../api/authApi";
import { authStorage } from "../../utils/authStorage";
import avatarImage from "../../assets/images/avatar.png";

import "./SystemUserSidebarFooter.css";

interface SystemUserSidebarFooterProps {
  collapsed: boolean;
}

function SystemUserSidebarFooter({ collapsed }: SystemUserSidebarFooterProps) {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Lấy thông tin tài khoản từ Backend
  useEffect(() => {
    let active = true;

    const fetchUser = async () => {
      try {
        const userData = await authApi.getMe();

        if (active) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Không thể lấy thông tin tài khoản:", error);

        if (active) {
          message.error("Không thể tải thông tin tài khoản.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchUser();

    return () => {
      active = false;
    };
  }, []);

  // Đăng xuất
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const refreshToken = authStorage.getRefreshToken();

      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
    } finally {
      authStorage.clearTokens();

      setUser(null);
      setLoggingOut(false);

      navigate(ROUTES.LOGIN, {
        replace: true,
      });
    }
  };

  const displayName = loading
    ? "Đang tải..."
    : user?.fullName || user?.username || "Người dùng";

  const displayLocation = user?.facilityName || user?.organizationName || "";

  const displayRole = user?.role || "";

  return (
    <div
      className={`system-sidebar-footer ${
        collapsed ? "system-sidebar-footer--collapsed" : ""
      }`}>
      <div className="system-sidebar-user">
        <img
          src={avatarImage}
          alt="Ảnh đại diện"
          className="system-sidebar-avatar"
        />

        {!collapsed && (
          <div className="system-sidebar-user-info">
            <span className="system-sidebar-user-name">{displayName}</span>

            {displayLocation && (
              <span className="system-sidebar-user-location">
                {displayLocation}
              </span>
            )}

            {displayRole && (
              <span className="system-sidebar-user-role">{displayRole}</span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="system-sidebar-logout"
        onClick={() => void handleLogout()}
        disabled={loggingOut}
        aria-label="Đăng xuất"
        title={loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}>
        <LogOut size={20} strokeWidth={2} />
      </button>
    </div>
  );
}

export default SystemUserSidebarFooter;

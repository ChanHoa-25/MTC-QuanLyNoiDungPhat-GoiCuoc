import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  birthday: string;
  role: string;
  roleLabel: string;
  timezone: string;
  orgName: string;
  isFirstLogin: boolean;
  has2FA: boolean;
  accountStatus: "active" | "suspended";
  currentPackage: {
    id: string;
    name: string;
    capacity: string;
    cycle: string;
    expirationDate: string;
    autoRenew: boolean;
    isExpired: boolean;
    storageUsedMB: number;
    storageTotalMB: number;
    devicesUsed: number;
    devicesMax: number;
  };
}

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => { success: boolean; message: string; isFirstLogin?: boolean };
  logout: () => void;
  dismissFirstLogin: () => void;
  enable2FA: (token: string) => boolean;
  disable2FA: () => void;
  changePassword: (oldP: string, newP: string) => { success: boolean; message: string };
  updateProfile: (data: Partial<UserProfile>) => void;
  updateAutoRenew: (val: boolean) => void;
  renewCurrentSubscription: (months: number, newExpiry: string) => void;
}

const defaultUser: UserProfile = {
  id: "USR-001",
  username: "chinh.nguyen",
  firstName: "Chinh",
  lastName: "Nguyen",
  fullName: "Chinh Nguyen",
  email: "chinh.nguyen@alta.com.vn",
  phone: "0909123456",
  birthday: "1995-10-24",
  role: "admin",
  roleLabel: "Quản trị viên",
  timezone: "Asia/Ho_Chi_Minh",
  orgName: "Trung tâm Văn hóa Quận 1 - TP.HCM",
  isFirstLogin: false,
  has2FA: false,
  accountStatus: "active",
  currentPackage: {
    id: "PKG003",
    name: "Gói Tiêu chuẩn 20GB",
    capacity: "20GB",
    cycle: "Theo năm",
    expirationDate: "28/11/2026",
    autoRenew: true,
    isExpired: false,
    storageUsedMB: 8400,
    storageTotalMB: 20480,
    devicesUsed: 11,
    devicesMax: 15,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "mtc_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(AUTH_KEY));
  });

  useEffect(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch {
      // ignore
    }
  }, [user, isAuthenticated]);

  const login = (username: string, pass: string) => {
    const trimmedUser = username.trim().toLowerCase();

    // Tài khoản thử nghiệm lần đầu đăng nhập
    if (trimmedUser === "newuser" || trimmedUser === "tv2") {
      const firstTimeUser: UserProfile = {
        ...defaultUser,
        id: "USR-FIRST",
        username: trimmedUser,
        firstName: "Gia Bảo",
        lastName: "Lê",
        fullName: "Lê Gia Bảo (TV2)",
        email: "tv2.legiabao@mtc.vn",
        isFirstLogin: true,
        has2FA: false,
      };
      setUser(firstTimeUser);
      setIsAuthenticated(true);
      return { success: true, message: "Đăng nhập thành công!", isFirstLogin: true };
    }

    // Tài khoản bị ngưng hoạt động
    if (trimmedUser === "suspended") {
      return {
        success: false,
        message: "Tài khoản của bạn đang bị tạm ngưng hoạt động do vi phạm chính sách hoặc hết hạn hợp đồng.",
      };
    }

    // Đăng nhập bình thường
    if (pass.length >= 6) {
      const loggedUser: UserProfile = {
        ...defaultUser,
        username: username,
        isFirstLogin: false,
      };
      setUser(loggedUser);
      setIsAuthenticated(true);
      return { success: true, message: "Đăng nhập thành công!", isFirstLogin: false };
    }

    return {
      success: false,
      message: "Tên đăng nhập hoặc mật khẩu không chính xác (mật khẩu tối thiểu 6 ký tự).",
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(defaultUser);
    localStorage.removeItem(AUTH_KEY);
  };

  const dismissFirstLogin = () => {
    setUser((prev) => ({ ...prev, isFirstLogin: false }));
  };

  const enable2FA = (token: string) => {
    if (token && token.length === 6) {
      setUser((prev) => ({ ...prev, has2FA: true }));
      return true;
    }
    return false;
  };

  const disable2FA = () => {
    setUser((prev) => ({ ...prev, has2FA: false }));
  };

  const changePassword = (oldP: string, newP: string) => {
    if (!oldP) {
      return { success: false, message: "Vui lòng nhập mật khẩu cũ" };
    }
    if (newP.length < 6) {
      return { success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự" };
    }
    return { success: true, message: "Đổi mật khẩu thành công!" };
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const updateAutoRenew = (val: boolean) => {
    setUser((prev) => ({
      ...prev,
      currentPackage: {
        ...prev.currentPackage,
        autoRenew: val,
      },
    }));
  };

  const renewCurrentSubscription = (_months: number, newExpiry: string) => {
    setUser((prev) => ({
      ...prev,
      currentPackage: {
        ...prev.currentPackage,
        expirationDate: newExpiry,
        isExpired: false,
      },
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        dismissFirstLogin,
        enable2FA,
        disable2FA,
        changePassword,
        updateProfile,
        updateAutoRenew,
        renewCurrentSubscription,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

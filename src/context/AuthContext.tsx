import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, TwoFactorSettings, RoleType } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  twoFactor: TwoFactorSettings;
  sessionRemainingSec: number;
  isSessionExpired: boolean;
  trustedDevices: string[];
  switchUserRole: (role: RoleType | 'SystemAdmin') => void;
  updateUserProfile: (data: Partial<User>) => void;
  enableTwoFactor: (secret: string) => void;
  disableTwoFactor: () => void;
  useBackupCode: (code: string) => boolean;
  regenerateBackupCodes: () => void;
  trustCurrentDevice: () => void;
  resetSessionTimer: () => void;
  verifySessionPassword: (password: string) => boolean;
  dismissSessionModal: () => void;
}

const DEFAULT_2FA: TwoFactorSettings = {
  isEnabled: true,
  enabledDate: '2026-10-15T08:00:00Z',
  secretKey: 'MTC778899AABBCCDDEEFF00112233445', // 32 ký tự cố định theo SRS 5.2
  backupCodes: [
    { code: '9182 3012', used: true },
    { code: '4019 5821', used: false },
    { code: '6620 1948', used: false },
    { code: '3109 4820', used: false },
    { code: '8492 0183', used: false },
    { code: '2910 4920', used: false },
    { code: '7301 9482', used: false },
    { code: '1049 2840', used: false },
    { code: '5820 1934', used: false },
    { code: '4920 1840', used: false },
  ],
  trustedDevices: ['Chrome trên MacOS (Thiết bị này)', 'App MTC trên iPhone 15 Pro'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 15 * 60; // 15 phút theo SRS 5.2 & 5.4

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('mtc_currentUser');
    return saved ? JSON.parse(saved) : INITIAL_USERS[1]; // Mặc định là Org Admin (Lê Gia Bảo)
  });

  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [twoFactor, setTwoFactor] = useState<TwoFactorSettings>(() => {
    const saved = localStorage.getItem('mtc_2fa');
    return saved ? JSON.parse(saved) : DEFAULT_2FA;
  });

  const [sessionRemainingSec, setSessionRemainingSec] = useState<number>(SESSION_DURATION);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  // Đếm ngược session 15 phút
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionRemainingSec((prev) => {
        if (prev <= 1) {
          setIsSessionExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resetSessionTimer = () => {
    setSessionRemainingSec(SESSION_DURATION);
    setIsSessionExpired(false);
  };

  const verifySessionPassword = (password: string): boolean => {
    if (password && password.length >= 6) {
      resetSessionTimer();
      return true;
    }
    return false;
  };

  const dismissSessionModal = () => {
    // Chỉ quay lại hoặc giữ lại ở trang theo quy tắc SEC-SES
    setIsSessionExpired(false);
  };

  const switchUserRole = (role: RoleType | 'SystemAdmin') => {
    const matched = allUsers.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('mtc_currentUser', JSON.stringify(matched));
      resetSessionTimer();
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    localStorage.setItem('mtc_currentUser', JSON.stringify(updated));
  };

  const enableTwoFactor = (secret: string) => {
    const newSettings: TwoFactorSettings = {
      ...twoFactor,
      isEnabled: true,
      enabledDate: new Date().toISOString(),
      secretKey: secret,
    };
    setTwoFactor(newSettings);
    localStorage.setItem('mtc_2fa', JSON.stringify(newSettings));
  };

  const disableTwoFactor = () => {
    const newSettings: TwoFactorSettings = {
      ...twoFactor,
      isEnabled: false,
    };
    setTwoFactor(newSettings);
    localStorage.setItem('mtc_2fa', JSON.stringify(newSettings));
  };

  const useBackupCode = (inputCode: string): boolean => {
    const cleanInput = inputCode.replace(/\s+/g, '');
    const matchedIndex = twoFactor.backupCodes.findIndex(
      (b) => !b.used && b.code.replace(/\s+/g, '') === cleanInput
    );
    if (matchedIndex !== -1) {
      const updatedCodes = [...twoFactor.backupCodes];
      updatedCodes[matchedIndex].used = true;
      const updated = { ...twoFactor, backupCodes: updatedCodes };
      setTwoFactor(updated);
      localStorage.setItem('mtc_2fa', JSON.stringify(updated));
      return true;
    }
    return false;
  };

  const regenerateBackupCodes = () => {
    const newCodes = Array.from({ length: 10 }).map(() => ({
      code: `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      used: false,
    }));
    const updated = { ...twoFactor, backupCodes: newCodes };
    setTwoFactor(updated);
    localStorage.setItem('mtc_2fa', JSON.stringify(updated));
  };

  const trustCurrentDevice = () => {
    const deviceName = 'Chrome trên MacOS (Thiết bị này)';
    if (!twoFactor.trustedDevices.includes(deviceName)) {
      const updated = {
        ...twoFactor,
        trustedDevices: [...twoFactor.trustedDevices, deviceName],
      };
      setTwoFactor(updated);
      localStorage.setItem('mtc_2fa', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        twoFactor,
        sessionRemainingSec,
        isSessionExpired,
        trustedDevices: twoFactor.trustedDevices,
        switchUserRole,
        updateUserProfile,
        enableTwoFactor,
        disableTwoFactor,
        useBackupCode,
        regenerateBackupCodes,
        trustCurrentDevice,
        resetSessionTimer,
        verifySessionPassword,
        dismissSessionModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

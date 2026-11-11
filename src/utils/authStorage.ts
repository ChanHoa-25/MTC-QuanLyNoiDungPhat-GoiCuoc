const ACCESS_TOKEN_KEY = "mtc_access_token";
const REFRESH_TOKEN_KEY = "mtc_refresh_token";

export const authStorage = {
  getAccessToken: (): string | null => {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY));
  },
};

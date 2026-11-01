export const ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard",

  PROFILE: "/profile",
  EDIT_PROFILE: "/profile/edit",
  RENEWAL_HISTORY: "/profile/renewal-history",

  SITES: "/sites",
  DEVICES: "/devices",

  SOURCES: "/sources",
  SOURCE_MEDIA: "/sources/media",
  SOURCE_TEMPLATES: "/sources/templates",
  SOURCE_PLAYLISTS: "/sources/playlists",
  SOURCE_SHARED: "/sources/shared",

  BROADCASTS: "/broadcasts",

  REPORTS: "/reports",

  SETTINGS: "/settings",
  SETTINGS_CATEGORIES: "/settings/categories",
  SETTINGS_ROLES: "/settings/roles",
  SETTINGS_DISTRIBUTORS: "/settings/distributors",
  SETTINGS_LOGS: "/settings/logs",
  SETTINGS_NEWS_MODE: "/settings/news-mode",

  FORBIDDEN: "/403",
  NOT_FOUND: "/404",
} as const;

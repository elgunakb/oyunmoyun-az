export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_PATHS = {
  AUTH: {
    GOOGLE: '/api/auth/google',
    GUEST: '/api/auth/guest',
    GET_PROFILE: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
  },
};

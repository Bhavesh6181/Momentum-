import api from "../lib/axios";

export interface LoginRequest {
  usernameOrEmail: string;
  password?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password?: string;
}

export const authService = {
  login: async (request: LoginRequest) => {
    const response = await api.post("/auth/login", request);
    return response.data?.data;
  },

  register: async (request: RegisterRequest) => {
    const response = await api.post("/auth/register", request);
    return response.data?.data;
  },

  logout: async (token: string) => {
    const response = await api.post(`/auth/logout?token=${token}`);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  forgotPassword: async (request: ForgotPasswordRequest) => {
    const response = await api.post("/auth/forgot-password", request);
    return response.data;
  },

  resetPassword: async (request: ResetPasswordRequest) => {
    const response = await api.post("/auth/reset-password", request);
    return response.data;
  },
};

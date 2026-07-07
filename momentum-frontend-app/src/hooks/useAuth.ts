import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import api from "../lib/axios";

export const useAuth = () => {
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (request: { usernameOrEmail: string; password?: string }) => {
      // 1. Call real login endpoint
      const authData = await authService.login(request);
      
      if (authData && authData.accessToken) {
        // 2. Temporarily set tokens so the api.get calls below will have access token injected
        useAuthStore.getState().setTokens(authData.accessToken, authData.refreshToken);
        
        // 3. Fetch full profile
        const profileResponse = await api.get("/users/me");
        const userData = profileResponse.data?.data;
        if (userData) {
          const mappedUser = {
            id: userData.id.toString(),
            username: userData.username,
            email: userData.email,
            college: userData.profile?.college || undefined,
            branch: userData.profile?.branch || undefined,
            year: userData.profile?.graduationYear?.toString() || undefined,
            avatarUrl: userData.profile?.profilePictureUrl || undefined,
            onboardingCompleted: userData.profile?.onboardingCompleted || false,
            onboardingStep: userData.profile?.onboardingStep || 0,
          };
          return {
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            user: mappedUser,
          };
        }
      }
      throw new Error("Login failed: unable to fetch user profile.");
    },
    onSuccess: (data) => {
      if (data && data.accessToken && data.user) {
        storeLogin(data.user, data.accessToken, data.refreshToken);
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (request: { username: string; email: string; password?: string }) =>
      authService.register(request),
  });

  const logoutMutation = useMutation({
    mutationFn: (token: string) => authService.logout(token),
    onSuccess: () => {
      storeLogout();
    },
    onError: () => {
      // Clear store anyway on logout failure
      storeLogout();
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (request: { email: string }) => authService.forgotPassword(request),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (request: { token: string; password?: string }) => authService.resetPassword(request),
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgottingPassword: forgotPasswordMutation.isPending,
    forgotPasswordError: forgotPasswordMutation.error,

    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error,
  };
};

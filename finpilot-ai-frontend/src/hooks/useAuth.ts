import { useCallback } from "react";
import { authApi } from "../api/auth.api";
import { signedIn, signedOut } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { LoginPayload, RegisterPayload } from "../types/auth";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authApi.login(payload);
      dispatch(signedIn(result));
      return result.user;
    },
    [dispatch]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await authApi.register(payload);
      dispatch(signedIn(result));
      return result.user;
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(signedOut());
  }, [dispatch]);

  return {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "ADMIN",
    login,
    register,
    logout,
  };
}

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthTokenResponse, AuthUser } from "../types/auth";
import { clearStoredAuth, readStoredToken, readStoredUser, storeAuth } from "../utils/authStorage";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  token: readStoredToken(),
  user: readStoredUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<AuthTokenResponse>) {
      state.token = action.payload.access_token;
      state.user = action.payload.user;
      storeAuth(action.payload.access_token, action.payload.user);
    },
    signedOut(state) {
      state.token = null;
      state.user = null;
      clearStoredAuth();
    },
  },
});

export const { signedIn, signedOut } = authSlice.actions;
export default authSlice.reducer;

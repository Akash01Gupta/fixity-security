import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "user" | null;

interface AuthState {
  role: Role;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = { role: null, token: null, loading: true };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<{ role: Role; token?: string }>) {
      state.role = action.payload.role;
      state.token = action.payload.token ?? null;
      state.loading = false;

      if (typeof window !== "undefined") {
        if (state.role) localStorage.setItem("role", state.role);
        if (state.token) localStorage.setItem("admin_token", state.token);
      }
    },
    logout(state) {
      state.role = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("role");
        localStorage.removeItem("admin_token");
      }
    },
    loadRoleFromStorage(state) {
      if (typeof window !== "undefined") {
        state.role = (localStorage.getItem("role") as Role) ?? null;
        state.token = localStorage.getItem("admin_token");
      }
      state.loading = false;
    },
  },
});

export const { setRole, logout, loadRoleFromStorage } = authSlice.actions;
export default authSlice.reducer;
import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./customerSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

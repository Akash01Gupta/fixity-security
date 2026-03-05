"use client";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { loadRoleFromStorage } from "./authSlice";

const InitAuth = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(loadRoleFromStorage()); }, [dispatch]);
  return <>{children}</>;
};

export const ReduxProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <InitAuth>{children}</InitAuth>
  </Provider>
);

import { useContext } from "react";
import { NotificationContext } from "./NotificationContextValue";

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return ctx;
}

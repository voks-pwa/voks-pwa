import { useEffect } from "react";

import { subscribeAction, missionConsumer, retentionConsumer } from "@/core/action-engine";

import { notificationConsumer } from "@/features/notifications/services/notificationSubscriber";

export function useActionEngineSubscriptions() {
  useEffect(() => {
    const unsubMission = subscribeAction(missionConsumer);
    const unsubRetention = subscribeAction(retentionConsumer);
    const unsubNotification = subscribeAction(notificationConsumer);
    return () => {
      unsubMission();
      unsubRetention();
      unsubNotification();
    };
  }, []);
}

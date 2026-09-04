// src/services/webPush.ts

import { api } from "../api/axios";


const VAPID_PUBLIC_KEY =
  'BKHi7WoXzFXhIVOEdpUHlswT7cOyVaI5utf16fBEg_z0431y0r1kGu8BCxvGFdC8NnO0k1xW4YFy1VK3YjyygmQ';


function urlBase64ToUint8Array(
  base64String: string,
): Uint8Array {

  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4,
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (char) => char.charCodeAt(0),
    ),
  );
}


export async function enableWebPush(
  customerId: string,
) {

  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Service Worker not supported.",
    );
  }

  if (!("PushManager" in window)) {
    throw new Error(
      "Web Push not supported.",
    );
  }

  const permission =
    await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error(
      "Notification permission denied.",
    );
  }

  const registration =
    await navigator.serviceWorker.ready;

  let subscription =
    await registration.pushManager
      .getSubscription();

  if (!subscription) {

    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,

        applicationServerKey:
          urlBase64ToUint8Array(
            VAPID_PUBLIC_KEY,
          ),
      });
  }

  await api.post(
    `/push/subscribe?customer_id=${encodeURIComponent(
      customerId,
    )}`,
    subscription.toJSON(),
  );

  console.log(
    "✅ Web Push enabled",
  );

  return subscription;
}
self.addEventListener("push", (event) => {
  console.log("🔥 PUSH EVENT RECEIVED");

  event.waitUntil(
    (async () => {
      try {
        if (!event.data) {
          console.log("❌ No push data");
          return;
        }

        const data = event.data.json();

        console.log("📦 PUSH DATA:", data);

        await self.registration.showNotification(
          data.title || "FinPilot AI",
          {
            body:
              data.body ||
              "You have a new notification.",

            icon: "/icon-192.png",
            badge: "/icon-192.png",

            requireInteraction: true,

            data: {
              url: data.url || "/",
            },
          }
        );

        console.log("✅ NOTIFICATION SHOW SUCCESS");
      } catch (error) {
        console.error(
          "❌ NOTIFICATION SHOW FAILED:",
          error
        );
      }
    })()
  );
});


self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ NOTIFICATION CLICKED");

  event.notification.close();

  const url =
    event.notification.data?.url || "/";

  event.waitUntil(
    clients.openWindow(url)
  );
});
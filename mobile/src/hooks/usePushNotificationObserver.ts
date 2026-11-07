import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

type NotificationData = {
  type?: string;
  bookingId?: string;
  audience?: 'customer' | 'vendor';
};

// Route a tapped booking notification to the right detail screen. Vendor-facing
// notifications open the order screen; customer-facing ones open the booking.
function routeFromData(raw: unknown) {
  const data = (raw ?? {}) as NotificationData;
  if (data.type !== 'booking' || !data.bookingId) return;
  const id = String(data.bookingId);
  if (data.audience === 'vendor') {
    router.push(`/order/${id}`);
  } else {
    router.push(`/booking/${id}`);
  }
}

/**
 * Deep-link when the user taps a push notification — including a cold start,
 * since `useLastNotificationResponse` replays the launch response. Mount this
 * only once the navigation tree is ready.
 */
export function usePushNotificationObserver() {
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const data = lastResponse?.notification.request.content.data;
    if (data) routeFromData(data);
  }, [lastResponse]);
}

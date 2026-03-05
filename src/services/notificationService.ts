import API from './api';

// Register service worker and subscribe to push notifications
export const subscribeToPush = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');

    // Get VAPID public key from backend
    const { data } = await API.get('/notifications/vapid-public-key');
    const vapidPublicKey = data.publicKey;

    // Convert VAPID key to Uint8Array
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });

    // Save subscription to backend
    await API.post('/notifications/push-subscription', { subscription });
    return true;
  } catch (error) {
    console.error('Push subscription error:', error);
    return false;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
    await API.post('/notifications/push-subscription', { subscription: null });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
  }
};

// Save notification preferences to backend
export const saveNotificationPrefs = async (prefs: {
  email: boolean;
  push: boolean;
  aiDigest: boolean;
}) => {
  const { data } = await API.put('/notifications/prefs', prefs);
  return data;
};

// Load notification preferences from backend
export const getNotificationPrefs = async () => {
  const { data } = await API.get('/notifications/prefs');
  return data;
};

// Helper: convert VAPID key
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
};
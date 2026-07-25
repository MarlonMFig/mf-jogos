import { db } from './firebase';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';

export interface AutoNotificationSettings {
  autoNewHouseEnabled: boolean;
  autoNewHouseTitle: string;
  autoNewHouseBody: string;

  autoPromoEnabled: boolean;
  autoPromoTitle: string;
  autoPromoBody: string;

  autoPixSorteEnabled: boolean;
  autoPixSorteTitle: string;
  autoPixSorteBody: string;
}

export const DEFAULT_AUTO_NOTIFICATIONS: AutoNotificationSettings = {
  autoNewHouseEnabled: true,
  autoNewHouseTitle: '🎰 NOVA CASA DE APOSTAS NO MF JOGOS!',
  autoNewHouseBody: 'Cadastre-se na {houseName} e aproveite: {bonusTitle}!',

  autoPromoEnabled: true,
  autoPromoTitle: '🔥 PROMOÇÃO POR TEMPO LIMITADO!',
  autoPromoBody: 'Bônus exclusivo liberado na {houseName}: {bonusTitle}!',

  autoPixSorteEnabled: true,
  autoPixSorteTitle: '🎁 PIX DA SORTE LIBERADO!',
  autoPixSorteBody: 'Entre agora e garanta seu PIX de R$ {pixValue},00 no MF JOGOS!',
};

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      return reg;
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Register device in Firestore and request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    alert('Seu navegador ou dispositivo não possui suporte a Notificações Web. Se estiver no iOS, adicione o app à Tela de Início primeiro.');
    return false;
  }

  try {
    const swRegistration = await registerServiceWorker();
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      // Generate unique device sub ID
      let deviceSubId = localStorage.getItem('mf_pwa_sub_id');
      if (!deviceSubId) {
        deviceSubId = `sub_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
        localStorage.setItem('mf_pwa_sub_id', deviceSubId);
      }

      // Record subscription in Firestore
      try {
        const subRef = doc(db, 'notification_subscribers', deviceSubId);
        await setDoc(subRef, {
          subscribedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform || 'mobile',
          active: true
        }, { merge: true });
      } catch (e) {
        console.warn('Could not save subscription to Firestore:', e);
      }

      // Send welcome notification
      if (swRegistration && swRegistration.showNotification) {
        swRegistration.showNotification('🎉 Notificações Ativadas no MF JOGOS!', {
          body: 'Você receberá alertas em tempo real sobre o Pix da Sorte, novos bônus e rodadas grátis!',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          data: { url: '/' }
        } as any);
      } else {
        new Notification('🎉 Notificações Ativadas no MF JOGOS!', {
          body: 'Você receberá alertas em tempo real sobre o Pix da Sorte e novos bônus!',
          icon: '/icon-192.png'
        });
      }

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Send a notification to current device (or service worker)
 */
export async function sendLocalNotification(title: string, body: string, url: string = '/') {
  if (getNotificationPermissionStatus() !== 'granted') return;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          data: { url }
        } as any);
        return;
      }
    }
    
    new Notification(title, {
      body,
      icon: '/icon-192.png'
    });
  } catch (e) {
    console.warn('Error displaying notification:', e);
  }
}

/**
 * Count total subscribed devices in Firestore
 */
export async function getNotificationSubscribersCount(): Promise<number> {
  try {
    const snap = await getDocs(collection(db, 'notification_subscribers'));
    return snap.size || 0;
  } catch (e) {
    console.warn('Could not fetch subscribers count:', e);
    return 0;
  }
}

/**
 * Broadcast notification from Admin panel
 */
export async function broadcastPushNotification(title: string, body: string, url: string = '/'): Promise<boolean> {
  try {
    const broadcastRef = doc(db, 'config', 'push_notifications');
    const timestamp = new Date().toISOString();

    // Trigger local device notification if permitted
    sendLocalNotification(title, body, url);

    // Record in Firestore log
    await setDoc(broadcastRef, {
      lastSentAt: timestamp,
      latestTitle: title,
      latestBody: body,
      latestUrl: url,
    }, { merge: true });

    return true;
  } catch (e) {
    console.error('Error broadcasting notification:', e);
    return false;
  }
}

/**
 * Fetch automatic notification settings from Firestore
 */
export async function getAutoNotificationSettings(): Promise<AutoNotificationSettings> {
  try {
    const docRef = doc(db, 'config', 'auto_notifications');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_AUTO_NOTIFICATIONS, ...snap.data() };
    }
  } catch (e) {
    console.warn('Could not fetch auto notification settings:', e);
  }
  return DEFAULT_AUTO_NOTIFICATIONS;
}

/**
 * Save automatic notification settings to Firestore
 */
export async function saveAutoNotificationSettings(settings: AutoNotificationSettings): Promise<boolean> {
  try {
    const docRef = doc(db, 'config', 'auto_notifications');
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving auto notification settings:', e);
    return false;
  }
}

/**
 * Trigger Auto Notification for New House Added
 */
export async function triggerAutoNewHouseNotification(houseName: string, bonusTitle: string) {
  try {
    const settings = await getAutoNotificationSettings();
    if (!settings.autoNewHouseEnabled) return;

    const title = settings.autoNewHouseTitle || DEFAULT_AUTO_NOTIFICATIONS.autoNewHouseTitle;
    const body = (settings.autoNewHouseBody || DEFAULT_AUTO_NOTIFICATIONS.autoNewHouseBody)
      .replace(/{houseName}/g, houseName)
      .replace(/{bonusTitle}/g, bonusTitle);

    await broadcastPushNotification(title, body, '/');
  } catch (e) {
    console.warn('Error triggering auto new house notification:', e);
  }
}

/**
 * Trigger Auto Notification for Limited-time Promo / Exclusive Bonus
 */
export async function triggerAutoPromoNotification(houseName: string, bonusTitle: string) {
  try {
    const settings = await getAutoNotificationSettings();
    if (!settings.autoPromoEnabled) return;

    const title = settings.autoPromoTitle || DEFAULT_AUTO_NOTIFICATIONS.autoPromoTitle;
    const body = (settings.autoPromoBody || DEFAULT_AUTO_NOTIFICATIONS.autoPromoBody)
      .replace(/{houseName}/g, houseName)
      .replace(/{bonusTitle}/g, bonusTitle);

    await broadcastPushNotification(title, body, '/');
  } catch (e) {
    console.warn('Error triggering auto promo notification:', e);
  }
}

/**
 * Trigger Auto Notification for Pix da Sorte Activated
 */
export async function triggerAutoPixSorteNotification(pixValue: number) {
  try {
    const settings = await getAutoNotificationSettings();
    if (!settings.autoPixSorteEnabled) return;

    const title = settings.autoPixSorteTitle || DEFAULT_AUTO_NOTIFICATIONS.autoPixSorteTitle;
    const body = (settings.autoPixSorteBody || DEFAULT_AUTO_NOTIFICATIONS.autoPixSorteBody)
      .replace(/{pixValue}/g, String(pixValue));

    await broadcastPushNotification(title, body, '/');
  } catch (e) {
    console.warn('Error triggering auto Pix da Sorte notification:', e);
  }
}

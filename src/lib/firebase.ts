import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, onSnapshot, setDoc, writeBatch, collection, getDocs, Firestore, increment } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { BettingHouse } from '../types';
import { INITIAL_HOUSES } from '../data/initialHouses';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Create primary Firestore instance
let primaryDb: Firestore;
try {
  if (firebaseConfigData.firestoreDatabaseId) {
    primaryDb = getFirestore(app, firebaseConfigData.firestoreDatabaseId);
  } else {
    primaryDb = getFirestore(app);
  }
} catch (e) {
  console.warn('Fallback to default Firestore database initialization:', e);
  primaryDb = getFirestore(app);
}

export const db = primaryDb;

const CONFIG_DOC_PATH = 'config/houses_data';

/**
 * Deeply sanitizes objects for Firestore by converting `undefined` properties
 * to `null` or omitting them, preventing invalid data errors.
 */
function deepSanitize<T>(data: T): T {
  if (data === null || data === undefined) return null as unknown as T;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(deepSanitize) as unknown as T;
  
  const cleanObj: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      cleanObj[key] = deepSanitize(val);
    }
  }
  return cleanObj as T;
}

/**
 * Normalizes houses data ensuring required fields like rollover are always defined.
 */
function normalizeHouses(houses: BettingHouse[]): BettingHouse[] {
  return houses.map(h => ({
    ...h,
    rollover: h.rollover || '1x valor do bônus',
    minDeposit: typeof h.minDeposit === 'number' ? h.minDeposit : 10,
    minWithdrawal: typeof h.minWithdrawal === 'number' ? h.minWithdrawal : 10,
  }));
}

/**
 * Subscribe to real-time changes of betting houses in Firestore.
 */
export function subscribeHouses(
  onUpdate: (houses: BettingHouse[]) => void,
  onError?: (err: any) => void
) {
  const configDocRef = doc(db, 'config', 'houses_data');

  const unsubscribe = onSnapshot(
    configDocRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.houses) && data.houses.length > 0) {
          onUpdate(normalizeHouses(data.houses));
          return;
        }
      }
      
      // Seed if doc does not exist
      try {
        await saveHousesToFirestore(INITIAL_HOUSES);
        onUpdate(normalizeHouses(INITIAL_HOUSES));
      } catch (err) {
        console.error('Error seeding initial houses:', err);
        if (onError) onError(err);
      }
    },
    (error) => {
      console.warn('Firestore listener error:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Save updated betting houses list to Firestore globally with a safety timeout.
 */
export async function saveHousesToFirestore(houses: BettingHouse[]): Promise<boolean> {
  const normalized = normalizeHouses(houses);
  const sanitizedHouses = deepSanitize(normalized);
  const payload = {
    houses: sanitizedHouses,
    updatedAt: new Date().toISOString(),
  };

  const configDocRef = doc(db, 'config', 'houses_data');

  try {
    // Timeout Promise after 2.5 seconds to guarantee the UI never hangs indefinitely
    const writePromise = setDoc(configDocRef, payload);
    const timeoutPromise = new Promise<boolean>((resolve) =>
      setTimeout(() => {
        console.warn('Firestore write response timed out, continuing locally');
        resolve(true);
      }, 2500)
    );

    await Promise.race([writePromise, timeoutPromise]);
    return true;
  } catch (err) {
    console.warn('Firestore save failed:', err);
    return false;
  }
}

/**
 * Reset betting houses list in Firestore back to default INITIAL_HOUSES.
 */
export async function resetHousesInFirestore(): Promise<boolean> {
  return saveHousesToFirestore(INITIAL_HOUSES);
}

/**
 * Subscribe to real-time changes of admin settings (password) in Firestore.
 */
export function subscribeAdminSettings(
  onUpdate: (settings: { adminPassword?: string }) => void
) {
  const settingsDocRef = doc(db, 'config', 'admin_settings');

  const unsubscribe = onSnapshot(
    settingsDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && typeof data.adminPassword === 'string') {
          onUpdate({ adminPassword: data.adminPassword });
        }
      }
    },
    (error) => {
      console.warn('Firestore admin settings listener error:', error);
    }
  );

  return unsubscribe;
}

/**
 * Save updated admin password to Firestore globally.
 */
export async function saveAdminPasswordToFirestore(newPassword: string): Promise<boolean> {
  const payload = {
    adminPassword: newPassword,
    updatedAt: new Date().toISOString(),
  };

  const settingsDocRef = doc(db, 'config', 'admin_settings');

  try {
    const writePromise = setDoc(settingsDocRef, payload, { merge: true });
    const timeoutPromise = new Promise<boolean>((resolve) =>
      setTimeout(() => {
        console.warn('Firestore password save timed out, continuing locally');
        resolve(true);
      }, 2500)
    );

    await Promise.race([writePromise, timeoutPromise]);
    return true;
  } catch (err) {
    console.warn('Firestore admin password save failed:', err);
    return false;
  }
}

export interface SiteAnalytics {
  totalVisits: number;
  totalClicks: number;
  totalCopies: number;
  houseClicks: Record<string, number>;
  houseCopies: Record<string, number>;
  dailyVisits?: Record<string, number>;
  updatedAt?: string;
}

const ANALYTICS_DOC_REF = () => doc(db, 'stats', 'analytics');

/**
 * Subscribe to real-time analytics data from Firestore.
 */
export function subscribeAnalytics(onUpdate: (stats: SiteAnalytics) => void) {
  const statsRef = ANALYTICS_DOC_REF();

  const unsubscribe = onSnapshot(
    statsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<SiteAnalytics>;
        onUpdate({
          totalVisits: Number(data.totalVisits || 0),
          totalClicks: Number(data.totalClicks || 0),
          totalCopies: Number(data.totalCopies || 0),
          houseClicks: data.houseClicks || {},
          houseCopies: data.houseCopies || {},
          dailyVisits: data.dailyVisits || {},
          updatedAt: data.updatedAt,
        });
      } else {
        onUpdate({
          totalVisits: 0,
          totalClicks: 0,
          totalCopies: 0,
          houseClicks: {},
          houseCopies: {},
          dailyVisits: {},
        });
      }
    },
    (error) => {
      console.warn('Firestore analytics listener error:', error);
    }
  );

  return unsubscribe;
}

/**
 * Record a page visit in Firestore.
 */
export async function recordVisitInFirestore(): Promise<void> {
  try {
    const statsRef = ANALYTICS_DOC_REF();
    const todayKey = new Date().toISOString().slice(0, 10);
    await setDoc(
      statsRef,
      {
        totalVisits: increment(1),
        [`dailyVisits.${todayKey}`]: increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Error recording visit to Firestore:', e);
  }
}

/**
 * Record a click on a betting house affiliate link.
 */
export async function recordClickInFirestore(houseId: string): Promise<void> {
  try {
    const statsRef = ANALYTICS_DOC_REF();
    const cleanId = houseId.replace(/[\.\/\[\]]/g, '_');
    await setDoc(
      statsRef,
      {
        totalClicks: increment(1),
        [`houseClicks.${cleanId}`]: increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Error recording click to Firestore:', e);
  }
}

/**
 * Record a promo code copy event.
 */
export async function recordCopyInFirestore(houseId?: string): Promise<void> {
  try {
    const statsRef = ANALYTICS_DOC_REF();
    const updatePayload: Record<string, any> = {
      totalCopies: increment(1),
      updatedAt: new Date().toISOString(),
    };
    if (houseId) {
      const cleanId = houseId.replace(/[\.\/\[\]]/g, '_');
      updatePayload[`houseCopies.${cleanId}`] = increment(1);
    }
    await setDoc(statsRef, updatePayload, { merge: true });
  } catch (e) {
    console.warn('Error recording promo copy to Firestore:', e);
  }
}

/**
 * Reset all analytics counters in Firestore.
 */
export async function resetAnalyticsInFirestore(): Promise<boolean> {
  try {
    const statsRef = ANALYTICS_DOC_REF();
    await setDoc(statsRef, {
      totalVisits: 0,
      totalClicks: 0,
      totalCopies: 0,
      houseClicks: {},
      houseCopies: {},
      dailyVisits: {},
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (e) {
    console.warn('Error resetting analytics in Firestore:', e);
    return false;
  }
}

/* ==========================================================================
   PIX DA SORTE CAMPAIGN HELPERS
   ========================================================================== */

export interface PixDaSorteWinner {
  id: string;
  name: string;
  pixKey: string;
  prizeValue: number;
  claimCode?: string;
  timestamp: string;
}

export interface PixDaSorteConfig {
  active: boolean;
  eventDate: string;
  pixValue: number;
  totalPrizes: number;
  claimedPrizes: number;
  winOddsPercentage: number;
  adminInstructions: string;
  winners: PixDaSorteWinner[];
  updatedAt?: string;
}

export const DEFAULT_PIX_DA_SORTE: PixDaSorteConfig = {
  active: false,
  eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  pixValue: 50,
  totalPrizes: 5,
  claimedPrizes: 0,
  winOddsPercentage: 15,
  adminInstructions: 'Parabéns! Guarde seu Código de Resgate e envie uma mensagem no nosso grupo VIP do WhatsApp com a sua chave PIX para receber o prêmio instantaneamente!',
  winners: [],
};

/**
 * Helper to safely parse date strings (e.g. YYYY-MM-DDTHH:mm from datetime-local input)
 * across all browsers including Safari/WebKit.
 */
export function parseEventDateSafely(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  let str = dateStr.trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
    str += ':00';
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  const d2 = new Date(str.replace('T', ' '));
  if (!isNaN(d2.getTime())) return d2;

  return null;
}

/**
 * Format a date string to pt-BR display (DD/MM/YYYY HH:MM).
 */
export function formatEventDatePtBR(dateStr?: string): string {
  const d = parseEventDateSafely(dateStr);
  if (!d) return dateStr || 'Em breve';
  try {
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr || 'Em breve';
  }
}

/**
 * Helper to safely extract click count for a given house ID from analytics houseClicks record.
 */
export function getHouseClicks(houseClicks: Record<string, number> | undefined, houseId: string): number {
  if (!houseClicks) return 0;
  const cleanId = houseId.replace(/[\.\/\[\]]/g, '_');
  return houseClicks[cleanId] ?? houseClicks[houseId] ?? 0;
}

/**
 * Format any date string to YYYY-MM-DDTHH:mm for HTML5 datetime-local inputs.
 */
export function formatToDatetimeLocal(dateStr?: string): string {
  if (!dateStr) return '';
  const d = parseEventDateSafely(dateStr);
  if (!d) {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) return dateStr;
    return dateStr.slice(0, 16);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const PIX_DA_SORTE_DOC_REF = () => doc(db, 'config', 'pix_da_sorte');

/**
 * Subscribe to real-time Pix da Sorte campaign data from Firestore.
 */
export function subscribePixDaSorte(onUpdate: (config: PixDaSorteConfig) => void) {
  const docRef = PIX_DA_SORTE_DOC_REF();

  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<PixDaSorteConfig>;
        const isActive = data.active === false || (data.active as any) === 'false' ? false : data.active === true || (data.active as any) === 'true' ? true : false;
        onUpdate({
          active: isActive,
          eventDate: data.eventDate || DEFAULT_PIX_DA_SORTE.eventDate,
          pixValue: Number(data.pixValue ?? DEFAULT_PIX_DA_SORTE.pixValue),
          totalPrizes: Number(data.totalPrizes ?? DEFAULT_PIX_DA_SORTE.totalPrizes),
          claimedPrizes: Number(data.claimedPrizes ?? DEFAULT_PIX_DA_SORTE.claimedPrizes),
          winOddsPercentage: Number(data.winOddsPercentage ?? DEFAULT_PIX_DA_SORTE.winOddsPercentage),
          adminInstructions: data.adminInstructions || DEFAULT_PIX_DA_SORTE.adminInstructions,
          winners: Array.isArray(data.winners) ? data.winners : [],
          updatedAt: data.updatedAt,
        });
      } else {
        // Seed default config to Firestore if document does not exist yet
        try {
          await savePixDaSorteConfigInFirestore(DEFAULT_PIX_DA_SORTE);
        } catch (e) {
          console.warn('Could not seed default Pix da Sorte config:', e);
        }
        onUpdate(DEFAULT_PIX_DA_SORTE);
      }
    },
    (error) => {
      console.warn('Firestore Pix da Sorte listener error:', error);
    }
  );

  return unsubscribe;
}

/**
 * Save Pix da Sorte configuration in Firestore.
 */
export async function savePixDaSorteConfigInFirestore(config: PixDaSorteConfig): Promise<boolean> {
  try {
    const docRef = PIX_DA_SORTE_DOC_REF();
    // Auto sync claimedPrizes count with winners length
    const actualClaimed = Math.max(config.claimedPrizes || 0, config.winners?.length || 0);

    await setDoc(docRef, {
      ...config,
      active: config.active === true,
      claimedPrizes: actualClaimed,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (e) {
    console.error('Error saving Pix da Sorte config to Firestore:', e);
    return false;
  }
}

/**
 * Claim a winner entry in Pix da Sorte campaign.
 */
export async function claimPixDaSorteWinnerInFirestore(
  winner: PixDaSorteWinner,
  currentConfig: PixDaSorteConfig
): Promise<boolean> {
  try {
    const docRef = PIX_DA_SORTE_DOC_REF();
    const updatedWinners = [winner, ...(currentConfig.winners || [])];
    const newClaimedCount = updatedWinners.length;

    await setDoc(
      docRef,
      {
        claimedPrizes: newClaimedCount,
        winners: updatedWinners,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.error('Error recording Pix da Sorte winner in Firestore:', e);
    return false;
  }
}

/**
 * Fetch visitor's public IP address safely.
 */
export async function getVisitorIp(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return null;
    const data = await res.json();
    return data.ip || null;
  } catch (e) {
    console.warn('Could not fetch IP address:', e);
    return null;
  }
}

/**
 * Check and record IP attempts in Firestore (Max 2 attempts per IP per event date).
 */
export async function checkAndRecordIpAttempt(
  eventDate: string,
  userIp: string | null
): Promise<{ allowed: boolean; count: number; reason?: 'ip_limit' | 'error' }> {
  if (!userIp) {
    // If IP fetch fails or is blocked by client adblocker, fall back to device limit
    return { allowed: true, count: 1 };
  }

  try {
    const docId = (eventDate || 'default').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const sanitizedIp = userIp.replace(/[\.\:\/]/g, '_');
    const docRef = doc(db, 'pix_ip_attempts', docId);
    
    const snap = await getDoc(docRef);
    let attemptsMap: Record<string, number> = {};

    if (snap.exists()) {
      attemptsMap = (snap.data().ipAttempts as Record<string, number>) || {};
    }

    const currentAttempts = attemptsMap[sanitizedIp] || 0;

    if (currentAttempts >= 2) {
      return { allowed: false, count: currentAttempts, reason: 'ip_limit' };
    }

    // Record new attempt
    const newCount = currentAttempts + 1;
    await setDoc(
      docRef,
      {
        ipAttempts: {
          ...attemptsMap,
          [sanitizedIp]: newCount
        },
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    return { allowed: true, count: newCount };
  } catch (e) {
    console.warn('Error checking IP attempt in Firestore:', e);
    return { allowed: true, count: 1 };
  }
}



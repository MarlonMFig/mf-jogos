import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, writeBatch, collection, getDocs, Firestore } from 'firebase/firestore';
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


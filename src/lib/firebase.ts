import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc,
  deleteDoc
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

import { getAuth } from "firebase/auth";
export const auth = getAuth(app);

export interface FirebaseBooking {
  id?: string;
  salonId: string;
  salonName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  artistId: string;
  artistName: string;
  date: string; // YYYY/MM/DD
  time: string; // HH:MM
  status: "Confirmed" | "Completed" | "Cancelled";
  userName: string;
  userPhone: string;
  createdAt: string;
  rating?: number;
}

// Helper to remove undefined values from objects as Firestore doesn't support them
function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  Object.keys(result).forEach((key) => {
    if (result[key] === undefined) {
      delete result[key];
    }
  });
  return result;
}

// Firestore Error handler matching the firebase-integration skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collection reference
const BOOKINGS_COLLECTION = "bookings";

// Save booking to Firebase
export async function saveBookingToDb(booking: Omit<FirebaseBooking, "id">): Promise<string> {
  try {
    const dataToSave = cleanUndefined({
      ...booking,
      createdAt: booking.createdAt || new Date().toISOString()
    });
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), dataToSave);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, BOOKINGS_COLLECTION);
    throw error;
  }
}

// Fetch all bookings from Firebase
export async function fetchBookingsFromDb(): Promise<FirebaseBooking[]> {
  try {
    const q = query(collection(db, BOOKINGS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const bookings: FirebaseBooking[] = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      } as FirebaseBooking);
    });
    return bookings;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
    throw error;
  }
}

// Update booking status in Firebase
export async function updateBookingStatusInDb(id: string, status: "Confirmed" | "Completed" | "Cancelled"): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Update booking rating in Firebase
export async function updateBookingRatingInDb(id: string, rating: number): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(docRef, { rating });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

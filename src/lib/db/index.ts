import type { Store } from '../types';
import { sheetsStore } from './sheets';
import { firestoreStore } from './firestore';
// Ganti metode database lewat .env: DB_DRIVER=firestore | sheets
export const db: Store = process.env.DB_DRIVER === 'sheets' ? sheetsStore : firestoreStore;

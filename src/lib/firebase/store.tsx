import { store as db } from '@/lib/firebase/app';
import { FavRecord } from '@/types/FavRecord';
import { FirebaseUser } from '@/types/FirebaseUser';
import { FirebaseError } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

export class PrettyFirebaseError extends Error {
  readonly code: string;
  readonly message: string;

  constructor(error: Error) {
    super(error.message);

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'permission-denied':
          this.code = 'permission-denied';
          this.message = 'Permisson Denied.';
          break;
        default:
          this.code = 'unknown';
          this.message = error.message;
          break;
      }
    } else {
      this.code = 'unknown';
      this.message = error.message;
    }
  }
}

export const recordFav = async (user: FirebaseUser, record: FavRecord) => {
  const usersRef = collection(db, 'users');
  const userRef = doc(usersRef, user.uid);
  const favsRef = collection(userRef, 'favs');

  const existanceQuery = query(
    favsRef,
    where('url', '==', record.url),
    limit(1)
  );
  const existanceSnap = await getDocs(existanceQuery);
  if (!existanceSnap.empty) {
    return new PrettyFirebaseError(new Error('Record already exists.'));
  }

  return await addDoc(favsRef, record)
    .then((d) => d.id)
    .catch((e) => new PrettyFirebaseError(e));
};

export const getNumFavs = async (user: FirebaseUser) => {
  const usersRef = collection(db, 'users');
  const userRef = doc(usersRef, user.uid);
  const favsRef = collection(userRef, 'favs');

  const favsSnap = await getDocs(favsRef);
  return favsSnap.size;
};

export const getAllFavs = async (user: FirebaseUser): Promise<FavRecord[]> => {
  const usersRef = collection(db, 'users');
  const userRef = doc(usersRef, user.uid);
  const favsRef = collection(userRef, 'favs');

  const quer = query(favsRef, orderBy('date', 'desc'));
  const favsSnap = await getDocs(quer);
  return favsSnap.docs.map((d) => d.data() as FavRecord);
};

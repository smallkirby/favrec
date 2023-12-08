import { store as db, functions } from '@/lib/firebase/app';
import { FavRecord } from '@/types/FavRecord';
import { FirebaseUser } from '@/types/FirebaseUser';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

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

export const recordFav = async (url: string) => {
  const callable = httpsCallable(functions, 'recordPageInfo');

  return await callable({ url })
    .then((res: any) => {
      if (res.data.err) {
        return new PrettyFirebaseError(new Error(res.data.err));
      } else {
        return null;
      }
    })
    .catch((err) => {
      return new PrettyFirebaseError(err);
    });
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
  return favsSnap.docs.map((d) => {
    const data = d.data();
    return {
      ...(data as FavRecord),
      date: data.date.toDate(),
    };
  });
};

export const deleteFav = async (user: FirebaseUser, url: string) => {
  const usersRef = collection(db, 'users');
  const userRef = doc(usersRef, user.uid);
  const favsRef = collection(userRef, 'favs');
  const quer = query(favsRef, where('url', '==', url));
  const docSnap = await getDocs(quer);

  if (docSnap.size !== 0) {
    await deleteDoc(doc(favsRef, docSnap.docs[0].id));
  }
};

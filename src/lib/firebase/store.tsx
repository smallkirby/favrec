import { store as db, functions } from '@/lib/firebase/app';
import { Settings } from '@/types/Settings';
import { FavRecord } from '@/types/FavRecord';
import { FirebaseUser } from '@/types/FirebaseUser';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import algoliasearch from 'algoliasearch';

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

export const updateFav = async (url: string) => {
  const callable = httpsCallable(functions, 'updatePageInfo');

  return await callable({ url })
    .then((res: any) => {
      if (res.data.err) {
        return new PrettyFirebaseError(new Error(res.data.err));
      } else {
        const data = res.data.data;
        return {
          ...data,
          date: new Date(data.date),
        } as FavRecord;
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

  const favsSnap = await getCountFromServer(favsRef);
  return favsSnap.data().count;
};

export const getFavsPaginated = async (
  entPerPage: number,
  page: number
): Promise<FavRecord[]> => {
  const callable = httpsCallable(functions, 'getFavsPaginated');
  return await callable({
    limit: entPerPage,
    page,
  })
    .then((res: any) => {
      if (res.data.err) {
        return new PrettyFirebaseError(new Error(res.data.err));
      } else {
        return res.data.data;
      }
    })
    .catch((err) => {
      return new PrettyFirebaseError(err);
    });
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

export const getCustomToken = async () => {
  const callable = httpsCallable(functions, 'getCustomToken');
  return await callable()
    .then((res: any) => {
      if (res.data.err) {
        return new PrettyFirebaseError(new Error(res.data.err));
      } else {
        return res.data.data;
      }
    })
    .catch((err) => {
      return new PrettyFirebaseError(err);
    });
};

export const updateBskyAccount = async (
  username: string,
  appPassword: string
) => {
  const callable = httpsCallable(functions, 'updateBskyAccount');
  return await callable({ username, appPassword })
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

export const getGeneralSettings = async (
  user: FirebaseUser
): Promise<Settings | PrettyFirebaseError> => {
  const usersRef = collection(db, 'users');
  const userRef = doc(usersRef, user.uid);
  const settingsRef = collection(userRef, 'settings');
  const generalSettingsRef = doc(settingsRef, 'general');
  return await getDoc(generalSettingsRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as Settings;
      } else {
        return {
          bskyEnabled: false,
          bskyUsername: null,
          bskyPostSummary: false,
          bskyPostRecords: false,
          algoliaEnabled: false,
        };
      }
    })
    .catch((err) => {
      return new PrettyFirebaseError(err);
    });
};

export const updateGeneralSettings = async (
  user: FirebaseUser,
  obj: Record<string, any>
): Promise<null | PrettyFirebaseError> => {
  const usersRef = collection(db, 'users');
  const userRef = doc(usersRef, user.uid);
  const settingsRef = collection(userRef, 'settings');
  const generalSettingsRef = doc(settingsRef, 'general');
  if ((await getDoc(generalSettingsRef)).exists()) {
    return await updateDoc(generalSettingsRef, obj)
      .then(() => {
        return null;
      })
      .catch((err) => {
        return new PrettyFirebaseError(err);
      });
  } else {
    return await setDoc(generalSettingsRef, obj)
      .then(() => {
        return null;
      })
      .catch((err) => {
        return new PrettyFirebaseError(err);
      });
  }
};

export const deleteBskyAccount = async (user: FirebaseUser) => {
  const callable = httpsCallable(functions, 'deleteBskyAccount');
  const res = await callable()
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

  if (res != null) return res;

  const usersRef = collection(db, 'users');
  const userRef = doc(usersRef, user.uid);
  const settingsRef = collection(userRef, 'settings');
  const generalSettingsRef = doc(settingsRef, 'general');
  return await updateDoc(generalSettingsRef, {
    bskyUsername: deleteField(),
  })
    .then(() => null)
    .catch((err) => {
      return new PrettyFirebaseError(err);
    });
};

export const getOrCreateAlgoliaSecuredApiKey = async (
  user: FirebaseUser
): Promise<string | PrettyFirebaseError> => {
  const usersRefs = collection(db, 'users');
  const userRef = doc(usersRefs, user.uid);
  const settingsRef = collection(userRef, 'settings');
  const generalSettingsRef = doc(settingsRef, 'general');
  const generalSettingsSnap = await getDoc(generalSettingsRef);
  if (
    generalSettingsSnap.exists() &&
    generalSettingsSnap.data()?.algoliaApiKey
  ) {
    return generalSettingsSnap.data()?.algoliaApiKey;
  } else {
    return await createAlgoliaSecuredApiKey();
  }
};

export const createAlgoliaSecuredApiKey = async () => {
  const callable = httpsCallable(functions, 'createAlgoliaSecuredApiKey');
  return await callable()
    .then((res: any) => {
      if (res.data.err) {
        return new PrettyFirebaseError(new Error(res.data.err));
      } else {
        return res.data.data;
      }
    })
    .catch((err) => {
      return new PrettyFirebaseError(err);
    });
};

export const searchAlgolia = async (
  userKey: string,
  term: string
): Promise<FavRecord[]> => {
  const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID!,
    userKey
  );
  const index = client.initIndex('favs');
  const { hits } = await index.search<FavRecord>(term);

  return hits.map((hit) => ({
    ...hit,
    date: new Date(hit.date),
  }));
};

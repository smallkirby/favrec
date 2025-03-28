import { onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { createCustomToken, isAuthed } from './lib/auth';
import { fetchPageInfo } from './lib/fetch';
import { FavRecord } from './types/FavRecord';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

initializeApp();
setGlobalOptions({ region: 'asia-northeast1' });

const firestore = getFirestore();

type ResultType = {
  err: string | null;
  data: any;
};

export const updatePageInfo = onCall(
  { memory: '1GiB' },
  async (req): Promise<ResultType> => {
    const auth = req.auth;
    const data = req.data;

    if (!isAuthed(auth)) {
      return {
        err: 'Unauthorized',
        data: null,
      };
    }

    const uid = auth!.uid;
    const { url } = data;

    const favsRefs = firestore.collection('users').doc(uid).collection('favs');
    const docQuery = favsRefs.where('url', '==', url);
    const doc = await docQuery.get().then((snapshot) => {
      if (snapshot.empty) return null;
      return snapshot.docs[0];
    });
    if (doc === null) {
      return {
        err: 'Record not found',
        data: null,
      };
    }

    const page = await fetchPageInfo(url);
    if (!page) {
      return {
        err: 'Failed to fetch page',
        data: null,
      };
    }

    const record: FavRecord = {
      ...page,
      date: doc.data()!.date.toDate(),
    };

    const err = await doc.ref
      .update(record)
      .then(() => null)
      .catch((e) => e);
    if (err) {
      return {
        err: err.message,
        data: null,
      };
    }

    return {
      err: null,
      data: {
        ...record,
        date: record.date.getTime(),
      },
    };
  }
);

export const recordPageInfo = onCall(
  { memory: '1GiB' },
  async (req): Promise<ResultType> => {
    const auth = req.auth;
    const data = req.data;

    if (!isAuthed(auth)) {
      return {
        err: 'Unauthorized',
        data: null,
      };
    }

    const uid = auth!.uid;
    const { url } = data;

    const favsRefs = firestore.collection('users').doc(uid).collection('favs');
    const exist = await favsRefs
      .where('url', '==', url)
      .get()
      .then((snapshot) => !snapshot.empty);
    if (exist) {
      return {
        err: 'Already exists',
        data: null,
      };
    }

    const page = await fetchPageInfo(url);
    if (!page) {
      return {
        err: 'Failed to fetch page',
        data: null,
      };
    }

    const record: FavRecord = {
      ...page,
      date: new Date(),
    };

    const err = await firestore
      .collection('users')
      .doc(uid)
      .collection('favs')
      .add(record)
      .then(() => null)
      .catch((e) => e);
    if (err) {
      return {
        err: err.message,
        data: null,
      };
    }

    return {
      err: null,
      data: null, // TODO
    };
  }
);

export const getCustomToken = onCall(
  { memory: '1GiB' },
  async (req): Promise<ResultType> => {
    const auth = req.auth;

    if (!isAuthed(auth)) {
      return {
        err: 'Unauthorized',
        data: null,
      };
    }

    const token = await createCustomToken(auth!.uid);
    return {
      err: null,
      data: token,
    };
  }
);

export {
  updateBskyAccount,
  deleteBskyAccount,
  onPostRecordBsky,
} from './lib/bsky';

export {
  createAlgoliaSecuredApiKey,
  onAlgoliaIntegrationChanged,
  onAlgoliaRecordCreated,
  onAlgoliaRecordDeleted,
} from './lib/algolia';

export { getFavsPaginated } from './lib/get';

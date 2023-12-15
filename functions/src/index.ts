import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { createCustomToken, isAuthed } from './lib/auth';
import { fetchPageInfo } from './lib/fetch';
import { FavRecord } from './types/FavRecord';

const firestore = admin.firestore;

admin.initializeApp(functions.config().firebase);

type ResultType = {
  err: string | null;
  data: any;
};

export const updatePageInfo = functions
  .region('asia-northeast1')
  .runWith({
    memory: '1GB',
  })
  .https.onCall(async (data, context): Promise<ResultType> => {
    if (!isAuthed(context.auth)) {
      return {
        err: 'Unauthorized',
        data: null,
      };
    }

    const uid = context.auth!.uid;
    const { url } = data;

    const favsRefs = firestore()
      .collection('users')
      .doc(uid)
      .collection('favs');
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
  });

// NOTE: functions v2 currently has a bug that cannot pass `auth` to `onCall` function.
// https://github.com/firebase/firebase-tools/issues/5210
export const recordPageInfo = functions
  .region('asia-northeast1')
  .runWith({
    memory: '1GB',
  })
  .https.onCall(async (data, context): Promise<ResultType> => {
    if (!isAuthed(context.auth)) {
      return {
        err: 'Unauthorized',
        data: null,
      };
    }

    const uid = context.auth!.uid;
    const { url } = data;

    const favsRefs = firestore()
      .collection('users')
      .doc(uid)
      .collection('favs');
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

    const err = await firestore()
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
  });

export const getCustomToken = functions
  .region('asia-northeast1')
  .runWith({
    memory: '1GB',
  })
  .https.onCall(async (_, context): Promise<ResultType> => {
    if (!isAuthed(context.auth)) {
      return {
        err: 'Unauthorized',
        data: null,
      };
    }

    const token = await createCustomToken(context.auth!.uid);
    return {
      err: null,
      data: token,
    };
  });

export {
  updateBskyAccount,
  deleteBskyAccount,
  onPostRecordBsky,
} from './lib/bsky';

export { createAlgoliaSecuredApiKey } from './lib/algolia';

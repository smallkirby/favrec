import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { isAuthed } from './lib/auth';
import { fetchPageInfo } from './lib/fetch';
import { FavRecord } from './types/FavRecord';

const firestore = admin.firestore;

admin.initializeApp(functions.config().firebase);

type ResultType = {
  err: string | null;
};

// NOTE: functions v2 currently has a bug that cannot pass `auth` to `onCall` function.
// https://github.com/firebase/firebase-tools/issues/5210
export const recordPageInfo = functions
  .region('asia-northeast1')
  .https.onCall(async (data, context): Promise<ResultType> => {
    if (!isAuthed(context.auth)) {
      return {
        err: 'Unauthorized',
      };
    }

    const uid = context.auth!.uid;
    const { url } = data;
    const page = await fetchPageInfo(url);
    if (!page) {
      return {
        err: 'Failed to fetch page',
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
      };
    }

    return {
      err: null,
    };
  });

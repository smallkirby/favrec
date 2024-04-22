import * as functions from 'firebase-functions';
import { isAuthed } from './auth';
import { getFirestore } from 'firebase-admin/firestore';

const firestore = getFirestore();

export const getFavsPaginated = functions
  .region('asia-northeast1')
  .runWith({
    memory: '1GB',
  })
  .https.onCall(async (data, context) => {
    if (!isAuthed(context.auth)) {
      return {
        err: 'Unauthorized',
        data: null,
      };
    }

    const { page, limit } = data;
    if (page === undefined || limit === undefined) {
      return {
        err: 'Invalid input',
        data: null,
      };
    }

    const ref = firestore
      .collection('users')
      .doc(context.auth!.uid)
      .collection('favs')
      .limit(limit)
      .offset(page * limit);
    return await ref
      .get()
      .then((snap) => {
        return {
          err: null,
          data: snap.docs.map((doc) => {
            return {
              ...doc.data(),
              date: doc.data().date.toDate().toISOString(),
            };
          }),
        };
      })
      .catch((err) => {
        return {
          err: err.message,
          data: null,
        };
      });
  });

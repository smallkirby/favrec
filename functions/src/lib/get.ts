import { getFirestore } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { isAuthed } from './auth';

const firestore = getFirestore();

export const getFavsPaginated = onCall({ memory: '1GiB' }, async (req) => {
  const auth = req.auth;
  const data = req.data;

  if (!isAuthed(req.auth)) {
    return {
      err: 'Unauthorized',
      data: null,
    };
  }
  if (!auth || !auth.uid) {
    return {
      err: 'Invalid input',
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
    .doc(auth?.uid)
    .collection('favs')
    .orderBy('date', 'desc')
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

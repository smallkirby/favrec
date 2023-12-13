import { BskyAgent } from '@atproto/api';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { isAuthed } from './auth';

export const checkAccountLogin = async (
  username: string,
  appPassword: string
) => {
  const agent = new BskyAgent({
    service: 'https://bsky.social',
  });

  try {
    const res = await agent.login({
      identifier: username,
      password: appPassword,
    });
    return res.success;
  } catch (e) {
    return false;
  }
};

const registerPrifileFirestore = async (
  username: string,
  appPassword: string,
  uid: string
) => {
  const db = admin.firestore;
  const settingsRefs = db().collection('users').doc(uid).collection('settings');
  const integRefs = settingsRefs.doc('integrations');
  const err = await integRefs
    .set(
      {
        bskyAppPassword: appPassword,
      },
      { merge: true }
    )
    .then(() => null)
    .catch((e) => e);
  if (err) {
    return err;
  }

  const generalRefs = settingsRefs.doc('general');
  return await generalRefs
    .set(
      {
        bskyUsername: username,
      },
      { merge: true }
    )
    .then(() => null)
    .catch((e) => e);
};

export const updateBskyAccount = functions
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

    const { username, appPassword } = data;
    if (!username || !appPassword) {
      return {
        err: 'Invalid input',
        data: null,
      };
    }

    const success = await checkAccountLogin(username, appPassword);
    if (!success) {
      return {
        err: 'Failed to login to Bluesky',
        data: null,
      };
    } else {
      const err = await registerPrifileFirestore(
        username,
        appPassword,
        context.auth!.uid
      );
      if (err) {
        return {
          err: 'Failed to register profile to DB.',
          data: null,
        };
      } else {
        return {
          err: null,
          data: null,
        };
      }
    }
  });

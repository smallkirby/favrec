import algolia from 'algoliasearch';
import { isAuthed } from './auth';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

type AlgoliaAdminProfile = {
  applicationId: string;
  adminApiKey: string;
  searchApiKey: string;
};

const generateSecuredApiKey = (
  uid: string,
  profile: AlgoliaAdminProfile
): string => {
  const client = algolia(profile.applicationId, profile.adminApiKey);
  return client.generateSecuredApiKey(profile.searchApiKey, {
    filters: `userId:${uid}`,
  });
};

const dbGetSecuredApiKey = async (
  uid: string,
  profile: AlgoliaAdminProfile
): Promise<string | null> => {
  const db = admin.firestore;
  const generalSnap = await db()
    .collection('users')
    .doc(uid)
    .collection('settings')
    .doc('general')
    .get();

  if (generalSnap.exists) {
    const data = generalSnap.data();
    if (data && data.algoliaSecuredApiKey) {
      return data.algoliaSecuredApiKey;
    }
  }

  const apiKey = generateSecuredApiKey(uid, profile);
  if (generalSnap.exists) {
    await generalSnap.ref.update({
      algoliaSecuredApiKey: apiKey,
    });
  } else {
    await generalSnap.ref.set({
      algoliaSecuredApiKey: apiKey,
    });
  }

  return apiKey;
};

export const createAlgoliaSecuredApiKey = functions
  .region('asia-northeast1')
  .runWith({
    memory: '1GB',
    secrets: [
      'ALGOLIA_APPLICATION_ID',
      'ALGOLIA_ADMIN_API_KEY',
      'ALGOLIA_SEARCH_API_KEY',
    ],
  })
  .https.onCall(async (_, context) => {
    if (!isAuthed(context.auth)) {
      return {
        err: 'Unauthorized',
        data: null,
      };
    }

    return {
      err: null,
      data: await dbGetSecuredApiKey(context.auth!.uid, {
        applicationId: process.env.ALGOLIA_APPLICATION_ID!,
        adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY!,
        searchApiKey: process.env.ALGOLIA_SEARCH_API_KEY!,
      }),
    };
  });

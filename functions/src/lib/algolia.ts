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

const deleteAllUserRecords = async (
  uid: string,
  profile: AlgoliaAdminProfile
): Promise<void> => {
  const client = algolia(profile.applicationId, profile.adminApiKey);
  const index = client.initIndex('favs');
  await index.browseObjects({
    filters: `userId:${uid}`,
    batch: (batch) => {
      const objectIds = batch.map((item) => item.objectID);
      index.deleteObjects(objectIds);
    },
  });
};

const uploadAllUserRecords = async (
  uid: string,
  profile: AlgoliaAdminProfile
): Promise<void> => {
  const db = admin.firestore;
  const favsRefs = db()
    .collection('users')
    .doc(uid)
    .collection('favs')
    .orderBy('date', 'desc');
  const favsSnap = await favsRefs.get();
  const favs = favsSnap.docs.map((doc) => ({
    ...doc.data(),
    date: doc.data().date.toDate().getTime(),
    objectID: doc.id,
    userId: uid,
  }));

  const client = algolia(profile.applicationId, profile.adminApiKey);
  const index = client.initIndex('favs');
  await index.saveObjects(favs);
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

const canUseAlgolia = async (uid: string): Promise<boolean> => {
  const db = admin.firestore;
  const settingsRefs = db().collection('users').doc(uid).collection('settings');
  const generalRefs = settingsRefs.doc('general');
  const generalSnap = await generalRefs.get();

  if (generalSnap.exists && generalSnap.data()!.algoliaEnabled) {
    return true;
  } else {
    return false;
  }
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

    if ((await canUseAlgolia(context.auth!.uid)) === false) {
      return {
        err: 'Algolia integration is not  allowed by the user.',
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

export const onAlgoliaIntegrationChanged = functions.firestore
  .document('users/{uid}/settings/general')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const profile = {
      applicationId: process.env.ALGOLIA_APPLICATION_ID!,
      adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY!,
      searchApiKey: process.env.ALGOLIA_SEARCH_API_KEY!,
    };
    if (before && after && !before.algoliaEnabled && after.algoliaEnabled) {
      // Enabled
      await uploadAllUserRecords(context.params.uid, profile);
    } else if (
      before &&
      after &&
      before.algoliaEnabled &&
      !after.algoliaEnabled
    ) {
      // Disabled
      await deleteAllUserRecords(context.params.uid, profile);
    }
  });

export const onAlgoliaRecordCreated = functions.firestore
  .document('users/{uid}/favs/{fid}')
  .onCreate(async (snap, context) => {
    if (!(await canUseAlgolia(context.params.uid))) {
      return null;
    }

    const fav = snap.data();
    if (!fav) {
      return null;
    }

    const client = algolia(
      process.env.ALGOLIA_APPLICATION_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    const index = client.initIndex('favs');
    await index.saveObject({
      ...fav,
      date: fav.date.toDate().getTime(),
      userId: context.params.uid,
      objectID: snap.id,
    });

    return null;
  });

export const onAlgoliaRecordDeleted = functions.firestore
  .document('users/{uid}/favs/{fid}')
  .onDelete(async (snap, context) => {
    if (!(await canUseAlgolia(context.params.uid))) {
      return null;
    }

    const fav = snap.data();
    if (!fav) {
      return null;
    }

    const client = algolia(
      process.env.ALGOLIA_APPLICATION_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    const index = client.initIndex('favs');
    await index.browseObjects({
      filters: `objectID:${snap.id}`,
      batch: async (batch) => {
        const objectIds = batch.map((item) => item.objectID);
        await index.deleteObjects(objectIds);
      },
    });

    return null;
  });

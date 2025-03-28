import { algoliasearch } from 'algoliasearch';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { isAuthed } from './auth';

const algoliaSearchApiKey = defineSecret('ALGOLIA_SEARCH_API_KEY');
const algoliaAdminApiKey = defineSecret('ALGOLIA_ADMIN_API_KEY');
const algoliaApplicationId = defineSecret('ALGOLIA_APPLICATION_ID');

const firestore = getFirestore();

type AlgoliaAdminProfile = {
  applicationId: string;
  adminApiKey: string;
  searchApiKey: string;
};

const generateSecuredApiKey = (
  uid: string,
  profile: AlgoliaAdminProfile,
): string => {
  const client = algoliasearch(profile.applicationId, profile.adminApiKey);
  return client.generateSecuredApiKey({
    parentApiKey: profile.searchApiKey,
    restrictions: {
      filters: `userId:${uid}`,
    },
  });
};

const deleteAllUserRecords = async (
  uid: string,
  profile: AlgoliaAdminProfile,
): Promise<void> => {
  const client = algoliasearch(profile.applicationId, profile.adminApiKey);
  await client.deleteBy({
    indexName: 'favs',
    deleteByParams: {
      filters: `userId:${uid}`,
    },
  });
};

const uploadAllUserRecords = async (
  uid: string,
  profile: AlgoliaAdminProfile,
): Promise<void> => {
  const favsRefs = firestore
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

  const client = algoliasearch(profile.applicationId, profile.adminApiKey);
  await client.saveObjects({
    indexName: 'favs',
    objects: favs,
  });
};

const dbGetSecuredApiKey = async (
  uid: string,
  profile: AlgoliaAdminProfile,
): Promise<string | null> => {
  const generalSnap = await firestore
    .collection('users')
    .doc(uid)
    .collection('settings')
    .doc('general')
    .get();

  if (generalSnap.exists) {
    const data = generalSnap.data();
    if (data?.algoliaSecuredApiKey) {
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
  const settingsRefs = firestore
    .collection('users')
    .doc(uid)
    .collection('settings');
  const generalRefs = settingsRefs.doc('general');
  const generalSnap = await generalRefs.get();

  if (generalSnap.exists && generalSnap.data()?.algoliaEnabled) {
    return true;
  }
  return false;
};

export const createAlgoliaSecuredApiKey = onCall(
  {
    memory: '1GiB',
    secrets: [algoliaSearchApiKey, algoliaAdminApiKey, algoliaApplicationId],
  },
  async (req) => {
    const auth = req.auth;

    if (!isAuthed(auth)) {
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

    if ((await canUseAlgolia(auth.uid)) === false) {
      return {
        err: 'Algolia integration is not  allowed by the user.',
        data: null,
      };
    }

    if (
      !process.env.ALGOLIA_APPLICATION_ID ||
      !process.env.ALGOLIA_ADMIN_API_KEY ||
      !process.env.ALGOLIA_SEARCH_API_KEY
    ) {
      return {
        err: 'Unexpected error.',
        data: null,
      };
    }

    return {
      err: null,
      data: await dbGetSecuredApiKey(auth?.uid, {
        applicationId: process.env.ALGOLIA_APPLICATION_ID,
        adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
        searchApiKey: process.env.ALGOLIA_SEARCH_API_KEY,
      }),
    };
  },
);

export const onAlgoliaIntegrationChanged = onDocumentUpdated(
  {
    document: 'users/{uid}/settings/general',
    secrets: [algoliaSearchApiKey, algoliaAdminApiKey, algoliaApplicationId],
  },
  async (event) => {
    const data = event.data;
    if (!data) {
      return;
    }
    const params = event.params;

    if (
      !process.env.ALGOLIA_APPLICATION_ID ||
      !process.env.ALGOLIA_ADMIN_API_KEY ||
      !process.env.ALGOLIA_SEARCH_API_KEY
    ) {
      return;
    }

    const before = data.before.data();
    const after = data.after.data();
    const profile = {
      applicationId: process.env.ALGOLIA_APPLICATION_ID,
      adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
      searchApiKey: process.env.ALGOLIA_SEARCH_API_KEY,
    };
    if (before && after && !before.algoliaEnabled && after.algoliaEnabled) {
      // Enabled
      await uploadAllUserRecords(params.uid, profile);
    } else if (
      before &&
      after &&
      before.algoliaEnabled &&
      !after.algoliaEnabled
    ) {
      // Disabled
      await deleteAllUserRecords(params.uid, profile);
    }
  },
);

export const onAlgoliaRecordCreated = onDocumentCreated(
  {
    document: 'users/{uid}/favs/{fid}',
    secrets: [algoliaSearchApiKey, algoliaAdminApiKey, algoliaApplicationId],
  },
  async (event) => {
    const params = event.params;
    const snapshot = event.data;
    if (!snapshot) {
      return null;
    }

    if (!(await canUseAlgolia(params.uid))) {
      return null;
    }

    const fav = snapshot.data();
    if (!fav) {
      return null;
    }

    if (
      !process.env.ALGOLIA_APPLICATION_ID ||
      !process.env.ALGOLIA_ADMIN_API_KEY
    ) {
      return null;
    }

    const client = algoliasearch(
      process.env.ALGOLIA_APPLICATION_ID,
      process.env.ALGOLIA_ADMIN_API_KEY,
    );
    await client.saveObject({
      indexName: 'favs',
      body: {
        ...fav,
        date: fav.date.toDate().getTime(),
        userId: params.uid,
        objectID: snapshot.id,
      },
    });

    return null;
  },
);

export const onAlgoliaRecordDeleted = onDocumentDeleted(
  {
    document: 'users/{uid}/favs/{fid}',
    secrets: [
      'ALGOLIA_APPLICATION_ID',
      'ALGOLIA_ADMIN_API_KEY',
      'ALGOLIA_SEARCH_API_KEY',
    ],
  },
  async (event) => {
    const params = event.params;
    const snapshot = event.data;
    if (!snapshot) {
      return null;
    }

    if (!(await canUseAlgolia(params.uid))) {
      return null;
    }

    const fav = snapshot.data();
    if (!fav) {
      return null;
    }

    if (
      !process.env.ALGOLIA_APPLICATION_ID ||
      !process.env.ALGOLIA_ADMIN_API_KEY
    ) {
      return null;
    }

    const client = algoliasearch(
      process.env.ALGOLIA_APPLICATION_ID,
      process.env.ALGOLIA_ADMIN_API_KEY,
    );
    await client.deleteObject({
      indexName: 'favs',
      objectID: snapshot.id,
    });

    return null;
  },
);

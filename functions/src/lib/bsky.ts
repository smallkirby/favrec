import { BskyAgent, RichText } from '@atproto/api';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isAuthed } from './auth';
import ogs from 'open-graph-scraper';
import sharp from 'sharp';

const checkAccountLogin = async (username: string, appPassword: string) => {
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

const canPostRecord = async (uid: string): Promise<boolean> => {
  const db = admin.firestore;
  const settingsRefs = db().collection('users').doc(uid).collection('settings');
  const generalRefs = settingsRefs.doc('general');
  const generalSnap = await generalRefs.get();

  const general = generalSnap.data();
  return general && general.bskyUsername && general.bskyPostRecords;
};

const getBskyCredential = async (
  uid: string
): Promise<{
  username: string;
  password: string;
}> => {
  const db = admin.firestore;
  const settingsRefs = db().collection('users').doc(uid).collection('settings');
  const integRefs = settingsRefs.doc('integrations');
  const integSnap = await integRefs.get();

  const integ = integSnap.data();
  if (!integ || !integ.bskyAppPassword) {
    throw new Error('No Bsky app password');
  }
  const passdowd = integ.bskyAppPassword;

  const generalRefs = settingsRefs.doc('general');
  const generalSnap = await generalRefs.get();
  const general = generalSnap.data();
  if (!general || !general.bskyUsername) {
    throw new Error('No Bsky username');
  }
  const username = general.bskyUsername;

  return { username, password: passdowd };
};

type OgImage = {
  url: string;
  type: string;
  description: string;
  title: string;
  uint8Array: Uint8Array;
};

const getOgImageFromUrl = async (
  url: string,
  fallbackImgurl: string | null
): Promise<OgImage | null> => {
  const options = { url: url };
  const { result } = await ogs(options);
  if (
    (result.ogImage === undefined || result.ogImage.length === 0) &&
    fallbackImgurl === null
  ) {
    return null;
  }
  const res = await fetch(result.ogImage?.at(0)?.url || fallbackImgurl!);

  const buffer = await res.arrayBuffer();
  const compressedImage = await sharp(buffer)
    .resize(800, null, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toBuffer();

  return {
    url: result.ogImage?.at(0)?.url || '',
    type: result.ogImage?.at(0)?.type || '',
    description: result.ogDescription || '',
    title: result.ogTitle || '',
    uint8Array: new Uint8Array(compressedImage),
  };
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

export const deleteBskyAccount = functions
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

    const db = admin.firestore;
    const settingsRefs = db()
      .collection('users')
      .doc(context.auth!.uid)
      .collection('settings');
    const integRefs = settingsRefs.doc('integrations');
    const err = await integRefs
      .update({
        bskyAppPassword: FieldValue.delete(),
      })
      .then(() => null)
      .catch((e) => e);

    if (err) {
      return {
        err: 'Failed to delete app password',
        data: null,
      };
    } else {
      return {
        err: null,
        data: null,
      };
    }
  });

export const onPostRecordBsky = functions.firestore
  .document('users/{uid}/favs/{fid}')
  .onCreate(async (snap, context) => {
    if (!(await canPostRecord(context.params.uid))) {
      return null;
    }

    const { username, password } = await getBskyCredential(context.params.uid);

    const record = snap.data();
    if (!record) {
      return;
    }

    const agent = new BskyAgent({
      service: 'https://bsky.social',
    });
    await agent.login({
      identifier: username,
      password,
    });

    const image = await getOgImageFromUrl(record.url, record.imageUrl);

    const rt = new RichText({ text: `I'm reading ${record.url}` });
    await rt.detectFacets(agent);

    const postRecord = {
      $type: 'app.bsky.feed.post',
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: record.url,
          title: record.title,
          description: record.description,
        },
      },
    };
    if (image !== null) {
      const imageBlob = await agent.uploadBlob(image.uint8Array, {
        encoding: 'image/jpeg',
      });
      Object.assign(postRecord.embed.external, {
        thumb: {
          $type: 'blob',
          ref: {
            $link: imageBlob.data.blob.ref.toString(),
          },
          mimeType: imageBlob.data.blob.mimeType,
          size: imageBlob.data.blob.size,
        },
      });
    }

    await agent.post(postRecord);

    return null;
  });

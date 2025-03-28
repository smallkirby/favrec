import { BskyAgent, RichText } from '@atproto/api';
import { onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { isAuthed } from './auth';
import ogs from 'open-graph-scraper';
import sharp from 'sharp';

const firestore = getFirestore();

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
  const settingsRefs = firestore
    .collection('users')
    .doc(uid)
    .collection('settings');
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
  const settingsRefs = firestore
    .collection('users')
    .doc(uid)
    .collection('settings');
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
  const settingsRefs = firestore
    .collection('users')
    .doc(uid)
    .collection('settings');
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

export const updateBskyAccount = onCall({ memory: '1GiB' }, async (req) => {
  const auth = req.auth;
  const data = req.data;

  if (!isAuthed(auth)) {
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
      auth!.uid
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

export const deleteBskyAccount = onCall({ memory: '1GiB' }, async (req) => {
  const auth = req.auth;

  if (!isAuthed(auth)) {
    return {
      err: 'Unauthorized',
      data: null,
    };
  }

  const settingsRefs = firestore
    .collection('users')
    .doc(auth!.uid)
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

export const onPostRecordBsky = onDocumentCreated(
  'users/{uid}/favs/{fid}',
  async (event) => {
    const params = event.params;

    if (!(await canPostRecord(params.uid))) {
      return null;
    }

    const { username, password } = await getBskyCredential(params.uid);

    const snapshot = event.data;
    if (!snapshot) {
      return;
    }
    const data = snapshot.data();

    const agent = new BskyAgent({
      service: 'https://bsky.social',
    });
    await agent.login({
      identifier: username,
      password,
    });

    const image = await getOgImageFromUrl(data.url, data.imageUrl);

    const rt = new RichText({ text: `I'm reading ${data.url}` });
    await rt.detectFacets(agent);

    const postRecord = {
      $type: 'app.bsky.feed.post',
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: data.url,
          title: data.title,
          description: data.description,
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
  }
);

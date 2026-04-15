import { getAuth } from 'firebase-admin/auth';
import type { CallableRequest } from 'firebase-functions/v2/https';

type CallableAuthData = CallableRequest['auth'];

export const isAuthed = (
  auth?: CallableAuthData,
): auth is NonNullable<CallableAuthData> => {
  if (auth === undefined) {
    return false;
  }
  return true;
};

export const createCustomToken = async (uid: string) => {
  return await getAuth().createCustomToken(uid);
};

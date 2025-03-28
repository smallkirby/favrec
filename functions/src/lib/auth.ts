import { getAuth } from 'firebase-admin/auth';
import type { AuthData } from 'firebase-functions/lib/common/providers/tasks';

export const isAuthed = (auth?: AuthData) => {
  if (auth === undefined) {
    return false;
  }
  return true;
};

export const createCustomToken = async (uid: string) => {
  return await getAuth().createCustomToken(uid);
};

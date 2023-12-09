import { getAuth } from 'firebase-admin/auth';
import { AuthData } from 'firebase-functions/lib/common/providers/tasks';

export const isAuthed = (auth?: AuthData) => {
  if (auth === undefined) {
    return false;
  } else {
    return true;
  }
};

export const createCustomToken = async (uid: string) => {
  return await getAuth().createCustomToken(uid);
};

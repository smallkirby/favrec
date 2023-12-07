import { AuthData } from 'firebase-functions/lib/common/providers/tasks';

export const isAuthed = (auth?: AuthData) => {
  if (auth === undefined) {
    return false;
  } else {
    return true;
  }
};

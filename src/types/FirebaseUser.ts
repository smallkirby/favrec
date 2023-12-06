export type FirebaseUser = {
  displayName: string | null;
  photoUrl: string | null;
  providerId: string;
  uid: string;
};

export type AuthContextState = {
  user: FirebaseUser | null | undefined;
};

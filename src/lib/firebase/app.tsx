import { type FirebaseOptions, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

// This is not a secret.
export const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyBj485Pk2FrtmBvNR9TcsAYKxPk52dMN_w',
  authDomain: 'favrec-4d401.firebaseapp.com',
  projectId: 'favrec-4d401',
  appId: '1:1051204428026:web:9f8591bad2bc0bc7fd6943',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const store = getFirestore(app);
const functions = getFunctions(app, 'asia-northeast1');

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(store, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, store, functions };

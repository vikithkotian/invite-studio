import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCCRWygM9ZNqy8TpbfB168LtFU5EX1ilTk",
  authDomain: "invitestudio-6c663.firebaseapp.com",
  projectId: "invitestudio-6c663",
  storageBucket: "invitestudio-6c663.firebasestorage.app",
  messagingSenderId: "60459630546",
  appId: "1:60459630546:web:a70bfca8fe4c26ddf5920b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
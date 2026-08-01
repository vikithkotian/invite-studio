import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';

export type GoogleAuthUser = {
  id: string;
  name: string;
  email: string;
};

export function GoogleLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 11.1H12v3.7h5.3c-.23 1.37-1.45 4.02-5.3 4.02-3.19 0-5.79-2.64-5.79-5.89S8.81 7.04 12 7.04c1.82 0 3.05.78 3.75 1.45l2.56-2.47C16.67 4.54 14.56 3.6 12 3.6 6.83 3.6 2.62 7.8 2.62 12.98S6.83 22.36 12 22.36c5.94 0 9.87-4.17 9.87-10.03 0-.67-.07-1.18-.18-1.69H21.35z" />
      <path fill="#34A853" d="M3.97 9.19l2.98 2.18C7.77 8.82 9.65 7.04 12 7.04c1.82 0 3.05.78 3.75 1.45l2.56-2.47C16.67 4.54 14.56 3.6 12 3.6 8.36 3.6 5.22 5.69 3.97 9.19z" />
      <path fill="#FBBC05" d="M12 22.36c2.47 0 4.54-.81 6.05-2.2l-2.8-2.29c-.78.53-1.79.85-3.25.85-3.13 0-5.78-2.11-6.72-4.98l-3.01 2.31C4.46 19.75 7.88 22.36 12 22.36z" />
      <path fill="#EA4335" d="M21.35 11.1H12v3.7h5.3c-.52 3.09-2.93 5.06-6.05 5.06-3.13 0-5.78-2.11-6.72-4.98l-3.01 2.31C3.14 19.56 7.22 22.36 12 22.36c5.94 0 9.87-4.17 9.87-10.03 0-.67-.07-1.18-.18-1.69H21.35z" />
    </svg>
  );
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const token = await result.user.getIdToken();
  const user: GoogleAuthUser = {
    id: result.user.uid,
    name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
    email: result.user.email || '',
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return { token, user };
}
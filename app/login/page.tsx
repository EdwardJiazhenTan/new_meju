'use client'

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => signIn('google', { callbackUrl: '/' })}>
        Sign in with google
      </button>
    </div>
  );
}

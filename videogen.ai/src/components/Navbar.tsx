'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  // status can be 'loading', 'authenticated', or 'unauthenticated'

  return (
    <nav className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold font-heading text-white hover:text-neutral-lighter transition-colors duration-300">
          videogen.ai
        </Link>
        <div className="space-x-4 flex items-center">
          <Link href="/about" className="hover:text-neutral-lightest hover:opacity-80 transition-colors duration-300">About</Link>
          <Link href="/pricing" className="hover:text-neutral-lightest hover:opacity-80 transition-colors duration-300">Pricing</Link>
          <Link href="/contact" className="hover:text-neutral-lightest hover:opacity-80 transition-colors duration-300">Contact</Link>

          {status === 'loading' && (
            <span className="text-sm text-neutral-lightest opacity-70">Loading...</span>
          )}

          {status === 'authenticated' && session?.user && (
            <>
              {/* Display user's name or email. Fallback to 'User' if not available. */}
              <span className="text-sm">Welcome, {session.user.name || session.user.email || 'User'}!</span>
              <Link href="/account" className="hover:text-neutral-lightest hover:opacity-80 transition-colors duration-300">Account</Link>
              <button
                onClick={() => signOut()}
                className="bg-secondary hover:bg-secondary-dark text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
              >
                Logout
              </button>
            </>
          )}

          {status === 'unauthenticated' && (
            <button
              // Calling signIn() without arguments will redirect to the default NextAuth.js sign-in page
              // which lists configured providers.
              // Alternatively, to sign in with a specific provider: signIn('google')
              onClick={() => signIn()}
              className="bg-neutral-lightest hover:bg-neutral-lighter text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

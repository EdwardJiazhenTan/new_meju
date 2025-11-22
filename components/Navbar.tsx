'use client'

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className='fixed top-0 left-0 right-0 border-b z-50 bg-background'>
      <div className="flex justify-between items-center px-6 py-3">

        {/* Logo/Brand */}
        <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
          Meju
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-3 items-center">
          {status === 'authenticated' ? (
            <>
              {/* User Info */}
              <span className="text-sm text-muted-foreground">{session.user?.name
                || session.user?.email}</span>

              <div className="h-4 w-px bg-border" />

              <Button variant="ghost" asChild>
                <Link href="/recipes">
                  Recipes
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/shuffle">
                  Shuffle
                </Link>
              </Button>

              <Button
                onClick={() => signOut({ callbackUrl: '/login' })}
                variant="outline"
                size="sm"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/login">
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

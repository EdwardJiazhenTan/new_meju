import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * Validates user authentication and returns user object
 * Returns error response if unauthorized or user not found
 */
export async function validateAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
      user: null
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      ),
      user: null
    };
  }

  return {
    error: null,
    user
  };
}

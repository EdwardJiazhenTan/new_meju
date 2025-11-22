import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { CreateRecipeSchema } from '@/lib/validations/recipe';
import { ZodError } from 'zod';

// GET /api/recipes -- get all recipes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ recipes });

  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/recipes -- create recipe
export async function POST(request: NextRequest) {
  try {
    // check for login status
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'user not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, lables } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'no title or content found' },
        { status: 400 }
      );
    }

    // create a new recipe
    const recipe = await prisma.recipe.create({
      data: {
        title,
        content,
        labels: lables || [],
        userId: user.id
      }
    });

    return NextResponse.json({ recipe }, { status: 200 });
  } catch (error) {
    console.error('Error create recipe: ', error);
    return NextResponse.json(
      { error: 'internal serer error' },
      { status: 500 }
    );
  }
}

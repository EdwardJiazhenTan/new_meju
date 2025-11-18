import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { CreateRecipeSchema } from '@/lib/validations/recipe';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

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

    // Validate with Zod
    const validated = CreateRecipeSchema.parse(body);

    // create a new recipe
    const recipe = await prisma.recipe.create({
      data: {
        title: validated.title,
        content: validated.content,
        labels: validated.labels || [],
        userId: user.id
      }
    });

    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Error create recipe: ', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

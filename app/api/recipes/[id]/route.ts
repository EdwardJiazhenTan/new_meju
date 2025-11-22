import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { CreateRecipeSchema, UpdateRecipeSchema } from '@/lib/validations/recipe';
import { ZodError } from 'zod';

// GET /api/recipes/[id] - get a single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id }
  });
  return NextResponse.json({ recipe });
}

// PUT /api/recipes/[id] - update recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
        { error: 'user not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = UpdateRecipeSchema.parse(body);

    const recipe = await prisma.recipe.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: validated,
    });

    if (recipe.count === 0) {
      return NextResponse.json(
        { error: 'recipe not found' },
        { status: 404 }
      );
    }

    const updateRecipe = await prisma.recipe.findUnique({
      where: { id }
    });

    return NextResponse.json({ recipe: updateRecipe });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error: ', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}


// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const result = await prisma.recipe.deleteMany({
      where: {
        id,
        userId: user.id, // Ensure user owns the recipe
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'recipe not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'recipe deleted' });
  } catch (error) {
    console.error('error deleting recipe', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

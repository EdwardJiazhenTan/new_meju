import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest
) {

  try {
    // validate auth 
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

    // query the dishes with the constrains.
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');
    const includeTags = searchParams.get('includeTags')?.split(',').filter(Boolen) || [];
    const excludeTags = searchParams.get('excludeTags')?.split(',').filter(Boolen) || [];

    const whereClause: any = {
      userId: user.id,
    }

    if (includeTags.length > 0) {
      whereClause.labels = {
        hasEvery: includeTags
      };
    }

    if (excludeTags.length > 0) {
      whereClause.NOT = {
        labels: {
          hasSome: excludeTags
        }
      };
    }

    const recipes = await prisma.recipe.findMany({
      where: whereClause,
    });

    //if theres less than days, return an error
    if (recipes.length < limit) {
      return NextResponse.json(
        {
          error: 'No enough recipe match constrains',
          available: recipes.length,
          requested: limit
        },
        { status: 400 }
      );
    }

    // shuffle array with fisher-yates algorithm
    const shuffled = [...recipes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j] = shuffled[j], shuffled[i]];
    }
    const result = shuffled.slice(0, limit);

    return NextResponse.json({ recipes: result });

  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

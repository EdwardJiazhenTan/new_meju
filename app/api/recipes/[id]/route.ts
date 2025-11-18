import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { CreateRecipeSchema } from '@/lib/validations/recipe';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

// get a single recipes information, 
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const recipeId = params.id;
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId }
  });
  return NextResponse.json({ recipe });
}

// put/patch/update, 
// delete


import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function RecipesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/login');
  }

  const recipes = await prisma.recipe.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="flex-1">
      <div className="border-b bg-background sticky top-0 z-10 p-4">
        <h1 className="text-2xl font-bold">Your Recipes</h1>
      </div>

      <div className="p-8">
        <div className="text-center text-muted-foreground mt-20">
          <p className="text-lg mb-2">Select a recipe from the sidebar to view details</p>
          <p className="text-sm">Total: {recipes.length} recipes</p>
        </div>
      </div>
    </main>
  );
}

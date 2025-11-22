import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RecipeForm } from '@/components/RecipeForm';

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

  const recipe = await prisma.recipe.findUnique({
    where: { id }
  });

  if (!recipe || recipe.userId !== user.id) {
    redirect('/recipes');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RecipeForm
        mode="edit"
        initialData={{
          id: recipe.id,
          title: recipe.title,
          content: recipe.content,
          labels: recipe.labels,
        }}
      />
    </div>
  );
}

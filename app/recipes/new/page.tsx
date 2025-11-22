import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { RecipeForm } from '@/components/RecipeForm';

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RecipeForm mode="create" />
    </div>
  );
}

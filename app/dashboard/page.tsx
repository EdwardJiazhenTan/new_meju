import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // get session on server
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
    <div>
      <h1> Dashboard</h1>
      <p>welcome, {session.user.name || session.user.email}</p>

      <div className="my-4">
        <Link
          href="/recipes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create New Recipe
        </Link>
      </div>

      <h2>your recipes ({recipes.length})</h2>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <h3>{recipe.title}</h3>
            <p>{recipe.labels.join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

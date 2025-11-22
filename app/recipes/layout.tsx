import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RecipesSidebar } from '@/components/RecipesSidebar';

export default async function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <SidebarProvider>
      <RecipesSidebar recipes={recipes} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

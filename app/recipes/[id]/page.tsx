import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { ExportPDFButton } from '@/components/ExportPDFButton';

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get selected recipe
  const selectedRecipe = await prisma.recipe.findUnique({
    where: { id }
  });

  // Check if recipe exists and belongs to user
  if (!selectedRecipe || selectedRecipe.userId !== user.id) {
    redirect('/recipes');
  }

  return (
    <main className="flex-1">
      {/* Recipe detail header */}
      <div className="border-b bg-background sticky top-0 z-10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold mb-4">{selectedRecipe.title}</h1>
              {/* Labels */}
              {selectedRecipe.labels.length > 0 && (
                <div className="flex gap-2 justify-center">
                  {selectedRecipe.labels.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-1 text-sm rounded bg-secondary text-secondary-foreground"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <ExportPDFButton
                recipe={{
                  title: selectedRecipe.title,
                  content: selectedRecipe.content,
                  labels: selectedRecipe.labels,
                }}
              />
              <Button variant="outline" asChild>
                <Link href={`/recipes/${selectedRecipe.id}/edit`}>
                  Edit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <MarkdownRenderer content={selectedRecipe.content} />
        </div>
      </div>
    </main>
  );
}

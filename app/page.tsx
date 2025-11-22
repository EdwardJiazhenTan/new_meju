import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <main className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-6 text-center max-w-3xl">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-balance">
            Welcome to Meju
          </h1>
          <p className="text-xl text-muted-foreground">
            Your personal recipe management platform. Store, organize, and discover your favorite recipes all in one place.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3 w-full max-w-5xl">
          <div className="flex flex-col gap-2 border rounded-lg p-6">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Organize Recipes
            </h3>
            <p className="leading-7 text-muted-foreground">
              Keep all your recipes in one place with powerful search and label organization.
            </p>
          </div>

          <div className="flex flex-col gap-2 border rounded-lg p-6">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Markdown Support
            </h3>
            <p className="leading-7 text-muted-foreground">
              Write your recipes in beautiful markdown with syntax highlighting and formatting.
            </p>
          </div>

          <div className="flex flex-col gap-2 border rounded-lg p-6">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Recipe Shuffle
            </h3>
            <p className="leading-7 text-muted-foreground">
              Can't decide what to cook? Let our shuffle feature pick a random recipe for you.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          {session ? (
            <>
              <Link
                href="/recipes"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                View Recipes
              </Link>
              <Link
                href="/recipes/new"
                className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Create Recipe
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 max-w-2xl text-center">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mb-6">
            How It Works
          </h2>
          <ul className="my-6 ml-6 list-disc text-left [&>li]:mt-2">
            <li>
              <strong className="font-semibold">Sign up</strong> with your email or Google account
            </li>
            <li>
              <strong className="font-semibold">Create recipes</strong> using our markdown editor with support for headings, lists, code blocks, and more
            </li>
            <li>
              <strong className="font-semibold">Organize</strong> your recipes with custom labels and powerful search
            </li>
            <li>
              <strong className="font-semibold">Access anywhere</strong> - your recipes are stored securely in the cloud
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

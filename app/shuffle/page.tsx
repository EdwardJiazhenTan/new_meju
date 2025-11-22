'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shuffle } from 'lucide-react';
import { RecipeCard } from '@/components/RecipeCard';
import { Recipe } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ShufflePage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [limit, setLimit] = useState(3);
  const [includeTagsInput, setIncludeTagsInput] = useState('');
  const [excludeTagsInput, setExcludeTagsInput] = useState('');

  const handleShuffle = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(includeTagsInput && { includeTags: includeTagsInput }),
        ...(excludeTagsInput && { excludeTags: excludeTagsInput }),
      })

      const res = await fetch(`/api/shuffle?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to shuffle');
      }

      setRecipes(data.recipes);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'an error occured');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight mb-2">
          Recipe Shuffle
        </h1>
        <p className="text-muted-foreground">
          Can't decide what to cook? Let us pick random recipes for you based on your preferences.
        </p>
      </div>

      {/* Filter form */}
      <div className="border rounded-lg p-6 mb-8 space-y-4 bg-card">
        <div className="space-y-2">
          <Label htmlFor="limit">Number of Recipes</Label>
          <Input
            id="limit"
            type="number"
            min="1"
            max="20"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="max-w-xs"
          />
          <p className="text-sm text-muted-foreground">
            How many random recipes to show (1-20)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="include-tags">Include Tags</Label>
          <Input
            id="include-tags"
            type="text"
            value={includeTagsInput}
            onChange={(e) => setIncludeTagsInput(e.target.value)}
            placeholder="e.g., dinner, italian"
          />
          <p className="text-sm text-muted-foreground">
            Comma-separated tags that recipes must have
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exclude-tags">Exclude Tags</Label>
          <Input
            id="exclude-tags"
            type="text"
            value={excludeTagsInput}
            onChange={(e) => setExcludeTagsInput(e.target.value)}
            placeholder="e.g., spicy, nuts"
          />
          <p className="text-sm text-muted-foreground">
            Comma-separated tags to avoid
          </p>
        </div>

        <Button
          onClick={handleShuffle}
          disabled={loading}
          className="mt-4"
        >
          <Shuffle className="mr-2 h-4 w-4" />
          {loading ? 'Shuffling...' : `Shuffle ${limit} Recipe${limit > 1 ? 's' : ''}`}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* result recipes */}
      {recipes.length > 0 && (
        <div>
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-6">
            Your Random Recipes
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {!loading && recipes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Shuffle className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Click the shuffle button above to get started!</p>
        </div>
      )}
    </div>
  );
}

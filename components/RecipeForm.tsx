'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RecipeFormProps {
  initialData?: {
    id?: string,
    title: string;
    content: string;
    labels: string[];
  };
  mode: 'create' | 'edit';
}

export function RecipeForm({ initialData, mode }: RecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>(initialData?.labels || []);

  const handleAddLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput('');
    }
  }

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = mode === 'create'
        ? '/api/recipes'
        : `/api/recipes/${initialData?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          labels,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save recipe');
      }

      const data = await response.json();
      router.push(`/recipes/${data.recipe.id}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occured');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
          {mode === 'create' ? 'Create New Recipe' : 'Edit Recipe'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === 'create'
            ? 'Add a new recipe to your collection using markdown formatting.'
            : 'Update your recipe details and content.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-lg font-semibold">
            Recipe Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            className="font-medium"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content" className="text-lg font-semibold">
            Recipe Content <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Use markdown formatting for headings, lists, and more.
          </p>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={20}
            className="font-mono text-sm"
          />
        </div>

        {/* Labels */}
        <div className="space-y-2">
          <Label htmlFor="label-input">Labels (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Add tags to help organize and find your recipes.
          </p>
          <div className="flex gap-2">
            <Input
              id="label-input"
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
              placeholder="e.g., dinner, italian, vegetarian"
            />
            <Button
              type="button"
              onClick={handleAddLabel}
              variant="secondary"
            >
              Add
            </Button>
          </div>

          {/* Display labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {labels.map((label) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  <span>{label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(label)}
                    className="hover:text-destructive ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Saving..." : mode === 'create' ? "Create Recipe" : "Update Recipe"}
          </Button>
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

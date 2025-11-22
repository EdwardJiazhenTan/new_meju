import Link from 'next/link';

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    content: string;
    labels: string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  showActions?: boolean;
}

export function RecipeCard({ recipe, showActions = false }: RecipeCardProps) {
  // Extract first few lines of content as preview
  const contentPreview = recipe.content
    .split('\n')
    .slice(0, 3)
    .join('\n')
    .substring(0, 150);

  return (
    <div className="border rounded-lg p-6 hover:border-primary/50 transition-colors bg-card">
      {/* Title */}
      <Link href={`/recipes/${recipe.id}`}>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3 hover:text-primary transition-colors">
          {recipe.title}
        </h3>
      </Link>

      {/* Content Preview */}
      <p className="text-muted-foreground leading-7 mb-4 line-clamp-3">
        {contentPreview}...
      </p>

      {/* Labels */}
      {recipe.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.labels.map((label) => (
            <span
              key={label}
              className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3 mt-4 pt-4 border-t">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Edit
          </Link>
          <Link
            href={`/recipes/${recipe.id}`}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            View
          </Link>
        </div>
      )}
    </div>
  );
}

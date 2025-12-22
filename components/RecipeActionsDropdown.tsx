'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Edit, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScheduleMealDialog } from '@/components/ScheduleMealDialog';

interface RecipeActionsDropdownProps {
  recipeId: string;
  recipe: {
    title: string;
    content: string;
    labels: string[];
  };
}

export function RecipeActionsDropdown({ recipeId, recipe }: RecipeActionsDropdownProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportMarkdown = () => {
    setIsExporting(true);

    try {
      // Create markdown content
      let markdownContent = `# ${recipe.title}\n\n`;

      // Add labels if present
      if (recipe.labels.length > 0) {
        markdownContent += `**Tags:** ${recipe.labels.join(', ')}\n\n`;
        markdownContent += '---\n\n';
      }

      // Add recipe content
      markdownContent += recipe.content;

      // Add footer
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      markdownContent += `\n\n---\n\n*Generated from Meju • ${currentDate}*`;

      // Create blob and download
      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });

      // Sanitize filename - remove special characters
      const sanitizedTitle = recipe.title
        .replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

      const filename = `${sanitizedTitle || 'recipe'}.md`;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Markdown export failed:', error);
      alert('Failed to export markdown. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href={`/recipes/${recipeId}/edit`} className="flex items-center gap-2 cursor-pointer">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportMarkdown} disabled={isExporting}>
          <Download className="h-4 w-4" />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <ScheduleMealDialog recipe={recipe} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
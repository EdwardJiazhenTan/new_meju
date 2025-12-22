'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportMarkdownButtonProps {
  recipe: {
    title: string;
    content: string;
    labels: string[];
  };
}

export function ExportMarkdownButton({ recipe }: ExportMarkdownButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
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
    <Button onClick={handleExport} disabled={isExporting} variant="outline">
      {isExporting ? (
        'Exporting...'
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export
        </>
      )}
    </Button>
  );
}
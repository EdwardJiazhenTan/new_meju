'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { RecipePDFDocument } from '@/components/pdf/RecipePDFDocument';
import { Download } from 'lucide-react';

interface ExportPDFButtonProps {
  recipe: {
    title: string;
    content: string;
    labels: string[];
  };
}

export function ExportPDFButton({ recipe }: ExportPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);

    try {
      // Generate PDF blob
      const blob = await pdf(<RecipePDFDocument recipe={recipe} />).toBlob();

      // Sanitize filename - remove special characters
      const sanitizedTitle = recipe.title
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

      const filename = `${sanitizedTitle || 'recipe'}.pdf`;

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
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isGenerating} variant="outline">
      {isGenerating ? (
        'Generating...'
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export
        </>
      )}
    </Button>
  );
}

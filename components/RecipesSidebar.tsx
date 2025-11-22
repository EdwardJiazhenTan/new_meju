'use client'

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface Recipe {
  id: string;
  title: string;
  labels: string[];
}

interface RecipesSidebarProps {
  recipes: Recipe[];
}

export function RecipesSidebar({ recipes }: RecipesSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRecipes = recipes.filter((recipe) => {
    const query = searchQuery.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(query) ||
      recipe.labels.some(label => label.toLowerCase().includes(query))
    );
  });

  const handleDelete = async (recipeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    setDeletingId(recipeId);

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      // If we're currently viewing the deleted recipe, redirect to recipes page
      if (pathname === `/recipes/${recipeId}`) {
        router.push('/recipes');
      }

      // Refresh the page to update the sidebar
      router.refresh();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Sidebar className="top-16 h-[calc(100vh-4rem)]">
      {/* Header with search and new recipe button */}
      <SidebarHeader>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Recipes</h2>
          <Button asChild size="sm" variant="default">
            <Link href="/recipes/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <SidebarInput
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SidebarHeader>

      {/* Scrollable content */}
      <SidebarContent>
        {filteredRecipes.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">
            {searchQuery ? 'No recipes found' : 'No recipes yet'}
          </p>
        ) : (
          <SidebarMenu>
            {filteredRecipes.map((recipe) => {
              const isActive = pathname === `/recipes/${recipe.id}`;
              return (
                <SidebarMenuItem key={recipe.id}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={`/recipes/${recipe.id}`}>
                      <span className="font-medium">{recipe.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={(e) => handleDelete(recipe.id, e)}
                    showOnHover
                    disabled={deletingId === recipe.id}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete recipe</span>
                  </SidebarMenuAction>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}
      </SidebarContent>

      {/* Footer with collapse button */}
      <SidebarFooter>
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          className="w-full justify-start"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Collapse
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

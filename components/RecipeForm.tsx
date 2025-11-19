'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

      //Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occured');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block font-medium mb-2">
          Title *
        </label>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
          placeholder="# Recipe title"
        />

        {/* Recipe content in markdown */}
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={15}
          className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
          placeholder="# Your Recipe goes here"
        />
      </div>

      {/* Labels */}
      <div>
        <label htmlFor="label-input" className="block fort-medium mb-2">
          Labels
        </label>
        <div className="flex gap-2 mb-2">
          <input
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
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            placeholder="e.g., dinner, italian, pork"
          />

          <button
            type="button"
            onClick={handleAddLabel}
            className="px-4 py-2 bg-gray-200 rounded hober:bg-gray-300 text-black"
          >
            Add
          </button>
        </div>

        {/* Display labels */}
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <div className="flex">
              <span
                key={label}
                className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {label}
              </span>

              <button
                type="button"
                onClick={() => handleRemoveLabel(label)}
                className="px-2 py-2 rounded bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-700"
              >
                x
              </button>
            </div>
          ))}
        </div>


        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-100 text-black rounded hover:bg-green-500 disabled:bg-gray-300"
          >
            {loading ? "Loading" : mode === 'create' ? "Create Recipe" : "Update Recipe"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className=" text-black px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>

      </div>
    </form>
  );
}

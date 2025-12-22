'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createGoogleCalendarUrl, calculateEndDate } from '@/lib/calendar-utils';

interface ScheduleMealDialogProps {
  recipe: {
    title: string;
    content: string;
    labels: string[];
  };
}

export function ScheduleMealDialog({ recipe }: ScheduleMealDialogProps) {
  const [open, setOpen] = useState(false);

  // Default to today at 6 PM
  const defaultDate = new Date();
  defaultDate.setHours(18, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(
    defaultDate.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
  );

  const handleSchedule = () => {
    const startDate = new Date(selectedDate);
    const endDate = calculateEndDate(startDate, 1); // 1 hour duration

    // Create event description with recipe content and reminder note
    const description = `${recipe.content}\n\n---\n\nReminder: Set for 1 hour before the meal\n\nGenerated from Meju`;

    const calendarUrl = createGoogleCalendarUrl({
      title: `Meal: ${recipe.title}`,
      description,
      startDate,
      endDate,
    });

    // Open Google Calendar in new tab
    window.open(calendarUrl, '_blank');

    // Close dialog
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm w-full">
          <Calendar className="h-4 w-4" />
          <span>Schedule</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Meal</DialogTitle>
          <DialogDescription>
            Choose when you want to prepare this meal. It will be added to your Google Calendar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="meal-datetime">Date & Time</Label>
            <Input
              id="meal-datetime"
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Duration: 1 hour • Reminder: 1 hour before
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Recipe</Label>
            <p className="text-sm font-medium">{recipe.title}</p>
            {recipe.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recipe.labels.map((label, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>
            <Calendar className="h-4 w-4 mr-2" />
            Add to Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
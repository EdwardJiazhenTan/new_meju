/**
 * Formats a date to Google Calendar format (YYYYMMDDTHHmmssZ)
 */
function formatGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Creates a Google Calendar URL with pre-filled event details
 */
export function createGoogleCalendarUrl(params: {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
}): string {
  const { title, description, startDate, endDate } = params;

  const searchParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    dates: `${formatGoogleCalendarDate(startDate)}/${formatGoogleCalendarDate(endDate)}`,
    // Add reminder 1 hour before (60 minutes)
    // Note: Google Calendar URL doesn't support reminders directly,
    // but we can add it to the description
  });

  return `https://calendar.google.com/calendar/render?${searchParams.toString()}`;
}

/**
 * Calculates end date based on start date and duration in hours
 */
export function calculateEndDate(startDate: Date, durationHours: number): Date {
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + durationHours);
  return endDate;
}
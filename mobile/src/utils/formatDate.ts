import { formatDistanceToNow, format, isToday, isYesterday, isThisYear } from 'date-fns';

/**
 * Format a date as relative time (e.g., "5 minutes ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Format a date in a smart way:
 * - Today: "Today at 3:45 PM"
 * - Yesterday: "Yesterday at 3:45 PM"
 * - This year: "Jan 15 at 3:45 PM"
 * - Other years: "Jan 15, 2023"
 */
export const formatSmartDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isThisYear(dateObj)) {
    return format(dateObj, 'MMM d \'at\' h:mm a');
  }
  
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Format a date as a short string (e.g., "Jan 15")
 */
export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d');
};

/**
 * Format a date as a full string (e.g., "January 15, 2023")
 */
export const formatFullDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM d, yyyy');
};

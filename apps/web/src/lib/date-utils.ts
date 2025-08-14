/**
 * Utility functions for consistent date formatting between server and client
 * Prevents hydration mismatches by ensuring same output on both sides
 */

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Use a consistent format that works the same on server and client
  return date.toLocaleDateString("da-DK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Use a consistent short format
  return date.toLocaleDateString("da-DK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// For server-side safe date formatting that avoids hydration issues
export function formatDateSafe(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Use ISO format to avoid locale differences between server/client
  return date.toISOString().split('T')[0];
}
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');

/**
 * Resolve a full image URL from a relative upload path or external URL.
 * 
 * - null/undefined → '/placeholder.svg'
 * - already absolute (http) → as-is
 * - relative path starting with /uploads → prepend API base
 * - anything else → pass through
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `${API_URL}${path}`;
  return path;
};


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


// Utility function to generate slugs
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}
// Get full URL for images/media
// Handles Cloudinary URLs, absolute URLs, and relative paths
export const getImageUrl = (path?: string) => {
  if (!path) return ''; // fallback if no image

  // Already a full URL (Cloudinary, external, etc.)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Relative path from backend - construct full URL
  // In production, use NEXT_PUBLIC_API_URL; in development, use localhost
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // If path starts with /, it's a relative path
  if (path.startsWith('/')) {
    return `${baseUrl}${path}`;
  }

  // Otherwise, assume it's a path that needs /uploads prefix
  return `${baseUrl}/uploads/${path}`;
};

export async function fetchAPI(endpoint: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`
  );

  if (!res.ok) throw new Error('API Error');

  return res.json();
}

// lib/publicApi.ts

export async function getPageContent(page: string) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:3001";

  const res = await fetch(`${apiUrl}/api/content/${page}`, {
    cache: "no-store",   // 🔥 VERY IMPORTANT
  });

  if (!res.ok) {
    throw new Error("Failed to fetch page content");
  }

  const data = await res.json();
  return data.data;
}

// Fetch case studies from backend
async function getCaseStudies() {
  try {
    const res = await fetch(`${API_URL}/api/case-studies?status=active`, {
      cache: 'no-store', // always get fresh data
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error('Error fetching case studies:', err);
    return [];
  }
}
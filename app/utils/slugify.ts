/**
 * N-CEDI — Slug generator
 *
 * Converts arbitrary text to a URL-safe slug.
 *
 * @example
 *   slugify('Digital Fabrication 101!')  // "digital-fabrication-101"
 *   slugify('  Hello   World  ')         // "hello-world"
 *   slugify('Café & Crème')              // "cafe-creme"
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')                    // Decompose accented characters
    .replace(/[\u0300-\u036F]/g, '')     // Strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')       // Remove non-alphanumeric (keep spaces & hyphens)
    .replace(/[\s_]+/g, '-')            // Replace spaces / underscores with hyphens
    .replace(/-{2,}/g, '-')             // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, '')            // Trim leading / trailing hyphens
}

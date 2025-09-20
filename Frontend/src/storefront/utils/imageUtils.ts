/**
 * Utility functions for handling image URLs
 */

/**
 * Converts a relative image URL to a full URL
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns The full URL for the image
 */
export const getFullImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's a relative URL, prepend the backend URL
  return `http://127.0.0.1:8001${imageUrl}`;
};

/**
 * Gets the image URL for banner images
 * @param imageUrl - The banner image URL from the API
 * @returns The full URL for the banner image
 */
export const getBannerImageUrl = (imageUrl: string | null | undefined): string | null => {
  return getFullImageUrl(imageUrl);
};

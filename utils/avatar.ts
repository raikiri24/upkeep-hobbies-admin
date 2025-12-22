/**
 * Utility functions for avatar generation
 */

/**
 * Generates a DiceBear avatar URL using the avataaars style
 * @param name - The name to use as seed for consistent avatars
 * @returns The avatar URL
 */
export const generateAvatarUrl = (name: string): string => {
  // Remove spaces and special characters, convert to lowercase for consistent seeding
  const seed = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

/**
 * Generates an avatar URL if none is provided
 * @param avatar - Existing avatar URL
 * @param name - Name to use as fallback seed
 * @returns The provided avatar URL or a generated one
 */
export const getAvatarUrl = (avatar: string | undefined, name: string): string => {
  if (avatar && avatar.trim() !== '') {
    return avatar;
  }
  return generateAvatarUrl(name);
};
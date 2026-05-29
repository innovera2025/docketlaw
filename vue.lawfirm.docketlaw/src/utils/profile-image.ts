/**
 * Get profile image path by position number
 * @param position - The profile image position number (1-18)
 * @returns The image path from assets/images/profile_img folder
 *
 * @example
 * getProfileImage(10) // returns '/src/assets/images/profile_img/10.png'
 * getProfileImage(5) // returns '/src/assets/images/profile_img/5.png'
 */
export function getProfileImage(position: number | string | undefined | null): string {
  // Handle undefined, null, or invalid values
  if (position === undefined || position === null || position === '') {
    return ''
  }

  // Convert to number if string
  const positionNum = typeof position === 'string' ? parseInt(position, 10) : position

  // Validate position is a valid number between 1-18
  if (isNaN(positionNum) || positionNum < 0 || positionNum > 17) {
    return ''
  }

  // Return the image path
  return new URL(`/src/assets/images/profile_img/${positionNum}.png`, import.meta.url).href
}

/**
 * Check if profile image position is valid
 * @param position - The profile image position number
 * @returns true if position is valid (1-18), false otherwise
 */
export function isValidProfilePosition(position: number | string | undefined | null): boolean {
  if (position === undefined || position === null || position === '') {
    return false
  }

  const positionNum = typeof position === 'string' ? parseInt(position, 10) : position
  return !isNaN(positionNum) && positionNum >= 0 && positionNum <= 17
}

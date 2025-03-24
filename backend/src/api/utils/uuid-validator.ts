/**
 * Validates if a string is a valid UUID
 * @param uuid String to validate
 * @returns True if the string is a valid UUID, false otherwise
 */
export const isValidUUID = (uuid: string): boolean => {
  // UUID v4 Regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}; 
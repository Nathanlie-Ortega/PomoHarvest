// src/utils/formatTime.js
/**
 * Formats seconds into a time string (MM:SS or HH:MM:SS)
 * @param {number} seconds - The number of seconds to format
 * @return {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Formats seconds into a human-readable duration
 * @param {number} seconds - The number of seconds to format
 * @return {string} - Human-readable duration string (e.g., "2h 15m")
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
};

export default {
  formatTime,
  formatDuration
};
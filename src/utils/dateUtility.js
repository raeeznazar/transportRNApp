/**
 * Convert current date/time to Indian Standard Time (IST)
 * @returns {string} ISO string in IST timezone
 */
export const getISTDateString = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString();
};

/**
 * Convert any date to IST
 * @param {Date} date - Date object to convert
 * @returns {string} ISO string in IST timezone
 */
export const toISTDateString = (date = new Date()) => {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istDate = new Date(date.getTime() + istOffset);
  return istDate.toISOString();
};

export function formatDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Full date object
const today = new Date();

// ISO format: "2026-03-12T00:00:00.000Z"
const todayISO = new Date().toISOString();

// Timestamp in milliseconds
const todayTimestamp = Date.now();

// Formatted date string: "3/12/2026"
const todayFormatted = new Date().toLocaleDateString();

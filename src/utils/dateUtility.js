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

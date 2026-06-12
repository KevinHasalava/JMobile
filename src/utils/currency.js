// Currency conversion and formatting utilities
import { API_BASE_URL } from '../services/api';

// Conversion rate: 1 USD = 370 LKR (approximate)
const USD_TO_LKR_RATE = 370;

/**
 * Convert USD price to LKR
 * @param {number} priceInUSD - Price in US Dollars
 * @returns {number} Price in Sri Lankan Rupees
 */
export const convertToLKR = (priceInUSD) => {
  return priceInUSD * USD_TO_LKR_RATE;
};

/**
 * Format price in LKR with proper comma separation
 * @param {number} priceInLKR - Price in Sri Lankan Rupees
 * @param {boolean} includeDecimals - Whether to show decimal places (default: false)
 * @returns {string} Formatted price string (e.g., "Rs. 443,630" or "Rs. 443,630.00")
 */
export const formatLKR = (priceInLKR, includeDecimals = false) => {
  const formatted = priceInLKR.toLocaleString('en-LK', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });
  return `Rs. ${formatted}`;
};

/**
 * Convert USD to LKR and format in one step
 * @param {number} priceInUSD - Price in US Dollars
 * @param {boolean} includeDecimals - Whether to show decimal places (default: false)
 * @returns {string} Formatted price string in LKR
 */
export const convertAndFormatPrice = (priceInUSD, includeDecimals = false) => {
  const priceInLKR = convertToLKR(priceInUSD);
  return formatLKR(priceInLKR, includeDecimals);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price in USD
 * @param {number} currentPrice - Current price in USD
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, currentPrice) => {
  if (originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Format price range in LKR
 * @param {number} minPriceUSD - Minimum price in USD
 * @param {number} maxPriceUSD - Maximum price in USD
 * @returns {string} Formatted price range (e.g., "Rs. 18,500 - Rs. 555,000")
 */
export const formatPriceRange = (minPriceUSD, maxPriceUSD) => {
  const minLKR = convertToLKR(minPriceUSD);
  const maxLKR = convertToLKR(maxPriceUSD);
  return `${formatLKR(minLKR)} - ${formatLKR(maxLKR)}`;
};

/**
 * Format price directly in Rupees (without USD conversion)
 * @param {number} priceInRupees - Price already in Sri Lankan Rupees
 * @param {boolean} includeDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted price string (e.g., "Rs. 125,000.00")
 */
export const formatRupees = (priceInRupees, includeDecimals = true) => {
  if (!priceInRupees || isNaN(priceInRupees)) {
    return 'Rs. 0.00';
  }
  const formatted = parseFloat(priceInRupees).toLocaleString('en-LK', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });
  return `Rs. ${formatted}`;
};

/**
 * Get the correct image URL for a product
 * Handles different image formats and ensures proper path
 * @param {string|array} image - Image URL or array of URLs from product
 * @returns {string} Correct image URL or placeholder
 */
export const getImageUrl = (image) => {
  if (!image) {
    return '/placeholder.png';
  }

  // If it's an array, get the first element
  if (Array.isArray(image)) {
    image = image[0];
  }

  // Auto-heal corrupted base64 images from previous bug (e.g. https://domain.comdata:image/...)
  if (typeof image === 'string' && image.match(/^https?:\/\/[^\/]+data:image\//)) {
    image = image.replace(/^https?:\/\/[^\/]+data:image\//, 'data:image/');
  }

  // If it's a URL (contains http:// or https://) or a base64 data URI, return as is
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:image/'))) {
    return image;
  }

  // If it's a local path, prepend /uploads/ or resolve API paths
  if (typeof image === 'string' && image.length > 0) {
    if (image.startsWith('/uploads/')) {
      return image;
    }
    if (image.startsWith('/api/')) {
      // Extract the origin/domain from API_BASE_URL if it has one (for local dev)
      // e.g. "http://localhost:5000/api" -> "http://localhost:5000"
      // e.g. "/api" -> ""
      const baseUrl = API_BASE_URL.replace(/\/api$/, '');
      return `${baseUrl}${image}`;
    }
    return `/uploads/${image}`;
  }

  return '/placeholder.png';
};

const currencyUtils = {
  convertToLKR,
  formatLKR,
  convertAndFormatPrice,
  calculateDiscountPercentage,
  formatPriceRange,
  formatRupees,
  getImageUrl,
};

export default currencyUtils;

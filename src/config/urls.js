const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

// API base: production backend. Override with VITE_API_URL in .env if needed.
const API_BASE_URL =
  normalizeBaseUrl(import.meta.env.VITE_API_URL) ||
  'https://backendapis.srivinayakacollections.com';

// Image base: used only for building image/upload URLs.
const IMAGE_BASE_URL =
  normalizeBaseUrl(import.meta.env.VITE_IMAGE_URL) ||
  'https://backendapis.srivinayakacollections.com';

const withBaseUrl = (baseUrl, maybePathOrUrl) => {
  if (!maybePathOrUrl) return '';
  let value = String(maybePathOrUrl);

  if (value.includes('localhost:5000')) {
    const index = value.indexOf('/uploads/');
    if (index !== -1) value = value.slice(index);
  }

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${baseUrl}${value}`;
  return `${baseUrl}/${value}`;
};

const getApiUrl = (pathOrUrl) => withBaseUrl(API_BASE_URL, pathOrUrl);
const getUploadUrl = (pathOrUrl) => withBaseUrl(IMAGE_BASE_URL, pathOrUrl);

const getImageDisplayUrl = (pathOrUrl) => {
  if (!pathOrUrl) return '';
  const v = String(pathOrUrl).trim();
  if (/^https?:\/\//i.test(v)) return v;
  return getUploadUrl(v);
};

export { API_BASE_URL, IMAGE_BASE_URL, getApiUrl, getUploadUrl, getImageDisplayUrl };

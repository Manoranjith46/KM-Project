/**
 * Custom MongoDB sanitizer middleware for Express 5
 * Prevents NoSQL injection by removing keys starting with '$' or containing '.'
 */

const sanitize = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    // Skip keys that could be used for NoSQL injection
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitize(obj[key]);
  }
  return sanitized;
};

const mongoSanitizer = () => {
  return (req, res, next) => {
    if (req.body) {
      req.body = sanitize(req.body);
    }
    if (req.params) {
      req.params = sanitize(req.params);
    }
    // In Express 5, req.query is read-only, so we sanitize via a new property
    if (req.query) {
      req.sanitizedQuery = sanitize({ ...req.query });
    }
    next();
  };
};

export default mongoSanitizer;

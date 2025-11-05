const ensureFields = (payload, fields) => {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }
};

export const requireFields = (fields) => (req, res, next) => {
  try {
    ensureFields(req.body, fields);
    return next();
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
};

export const normalizeArrayField = (value) => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter((item) => Boolean(item && item.trim())).map((item) => item.trim());
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

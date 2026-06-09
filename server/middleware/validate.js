export function validateBody(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({ error: err.errors?.[0]?.message || 'Invalid input' });
    }
  };
}

export function validateDto(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => req.body?.[field] === undefined);
    if (missing.length) {
      return res.status(400).json({
        error: "ValidationError",
        message: `Missing fields: ${missing.join(", ")}`
      });
    }
    next();
  };
}

// middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  // Fallbacks for unexpected errors
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.error("🔥 ERROR:", err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

function createHttpError(statusCode, message, detail) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.detail = detail;
  return error;
}

function sendErrorResponse(res, error, fallbackMessage) {
  const statusCode = error.statusCode || 500;
  const payload = {
    message: error.message || fallbackMessage || "Internal server error",
  };

  if (error.detail) {
    payload.detail = error.detail;
  } else if (statusCode === 500 && error.message) {
    payload.detail = error.message;
  }

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  createHttpError,
  sendErrorResponse,
};

const { createHttpError } = require("./httpError");

function requireId(value, label) {
  const id = Number(value);

  if (!id) {
    throw createHttpError(400, `Invalid ${label} id`);
  }

  return id;
}

function requireText(value, fieldName, message) {
  const normalizedValue = (value || "").toString().trim();

  if (!normalizedValue) {
    throw createHttpError(400, message || `${fieldName} is required`);
  }

  return normalizedValue;
}

function optionalId(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const id = Number(value);

  if (!id) {
    throw createHttpError(400, "Invalid owner id");
  }

  return id;
}

module.exports = {
  optionalId,
  requireId,
  requireText,
};

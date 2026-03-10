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

function requireIds(value, label) {
  const rawValue = Array.isArray(value) ? value.join(",") : value;
  const normalizedValue = (rawValue || "").toString().trim();

  if (!normalizedValue) {
    throw createHttpError(400, `Missing ${label}`);
  }

  const ids = normalizedValue.split(",").map((entry) => Number(entry.trim()));

  if (
    ids.length === 0 ||
    ids.some((id) => !Number.isInteger(id) || id <= 0)
  ) {
    throw createHttpError(400, `Invalid ${label}`);
  }

  return Array.from(new Set(ids));
}

module.exports = {
  optionalId,
  requireIds,
  requireId,
  requireText,
};

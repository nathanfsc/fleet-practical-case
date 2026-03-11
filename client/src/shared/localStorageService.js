function getStorage() {
  if (!window || !window.localStorage) {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getLocalStorageItem(key) {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalStorageItem(key, value) {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeLocalStorageItem(key) {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function clearLocalStorage() {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.clear();
    return true;
  } catch {
    return false;
  }
}

export function getJsonLocalStorageItem(key, fallbackValue) {
  const value = getLocalStorageItem(key);

  if (!value) {
    return fallbackValue;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

export function setJsonLocalStorageItem(key, value) {
  try {
    return setLocalStorageItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

import { useEffect, useState } from "react";

export function useAppFeedback() {
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setStatusMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  function clearErrors() {
    setErrors([]);
  }

  function appendError(message) {
    setErrors((prev) => [...prev, message]);
  }

  return {
    statusMessage,
    setStatusMessage,
    errors,
    clearErrors,
    appendError,
  };
}

export function getApiErrorMessage(error, fallbackMessage = "Something went wrong") {
  const data = error?.response?.data;

  if (!data) {
    return fallbackMessage;
  }

  if (data.fieldErrors && typeof data.fieldErrors === "object") {
    const firstFieldError = Object.values(data.fieldErrors).find(Boolean);
    if (firstFieldError) {
      return firstFieldError;
    }
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  return fallbackMessage;
}

export function getApiFieldErrors(error) {
  const fieldErrors = error?.response?.data?.fieldErrors;
  return fieldErrors && typeof fieldErrors === "object" ? fieldErrors : {};
}

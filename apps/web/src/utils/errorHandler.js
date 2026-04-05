/**
 * Sanitize error messages for user-friendly display
 * Prevents exposing technical details to end users
 */
export const getSafeErrorMessage = (error, context = "general") => {
  if (!error) return "Something went wrong. Please try again later.";

  const message = error?.response?.data?.message || error?.message || String(error);
  const lowerMsg = message.toLowerCase();

  // Check for network/server errors
  if (error?.code === "ECONNABORTED" || lowerMsg.includes("timeout")) {
    return "Connection timeout. Please check your internet and try again.";
  }

  if (error?.code === "ERR_NETWORK" || lowerMsg.includes("network")) {
    return "Network error. Please check your internet connection.";
  }

  if (error?.response?.status === 500 || lowerMsg.includes("500")) {
    return "Server is temporarily unavailable. Please try again in a few moments.";
  }

  if (error?.response?.status === 401 || lowerMsg.includes("unauthorized")) {
    return "Your session has expired. Please log in again.";
  }

  if (error?.response?.status === 403 || lowerMsg.includes("forbidden")) {
    return "You don't have permission to perform this action.";
  }

  if (error?.response?.status === 404 || lowerMsg.includes("not found")) {
    return "The requested resource was not found.";
  }

  if (error?.response?.status === 422 || lowerMsg.includes("validation")) {
    return "Some of the information you provided is invalid. Please check and try again.";
  }

  // Context-specific messages
  if (context === "password") {
    if (lowerMsg.includes("current")) {
      return "Your current password is incorrect.";
    }
    if (lowerMsg.includes("match") || lowerMsg.includes("mismatch")) {
      return "The new passwords don't match.";
    }
  }

  if (context === "household") {
    if (lowerMsg.includes("member")) {
      return "Could not save household member. Please check the details and try again.";
    }
  }

  if (context === "contact") {
    if (lowerMsg.includes("phone") || lowerMsg.includes("number")) {
      return "Please check the phone number format and try again.";
    }
  }

  // Default fallback for raw error messages that look technical
  if (
    message.includes("{") ||
    message.includes("Error:") ||
    message.includes("at ") ||
    message.startsWith("Cannot") ||
    message.startsWith("TypeError") ||
    message.startsWith("ReferenceError")
  ) {
    return "An error occurred while processing your request. Please try again.";
  }

  // If message looks user-friendly already, return it
  return message;
};

/**
 * Log error for debugging while showing safe message to user
 */
export const handleErrorWithLogging = (error, context = "general") => {
  // Log full error for developers
  console.error(`[${context}]`, error);

  // Return safe message for users
  return getSafeErrorMessage(error, context);
};


import axios from "axios";
import { NewsApiError } from "./newsApiError.js";

const RETRYABLE_STATUS_CODES = [500, 502, 503, 504];
const RETRYABLE_NETWORK_CODES = ["ECONNABORTED","ETIMEDOUT","ECONNRESET","EAI_AGAIN","ERR_NETWORK",];

export const isRetryableNewsApiError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  if (status) {
    return RETRYABLE_STATUS_CODES.includes(status);
  }

  return (
    error.code !== undefined &&
    RETRYABLE_NETWORK_CODES.includes(error.code)
  );
};

export const createNewsApiError = (error: unknown): NewsApiError => {
  if (!axios.isAxiosError(error)) {
    return new NewsApiError(
      "An unexpected error occurred while fetching news.",
      null,
      null
    );
  }

  const status = error.response?.status ?? null;
  const code = error.code ?? null;
  const retryAfterHeader = error.response?.headers?.["retry-after"];
  const retryAfter = typeof retryAfterHeader === "string" ? retryAfterHeader : null;

  let message = "Failed to communicate with the news provider.";

  switch (status) {
    case 401:
      message = "News API authentication failed. Check the API key.";
      break;

    case 403:
      message = "News API access is forbidden. Check your plan and permissions.";
      break;

    case 429:
      message = "News API rate limit exceeded. Try again later.";
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      message = "News provider is temporarily unavailable.";
      break;

    default:
      if (!error.response) {
        message = "Unable to reach the news provider. Check network connectivity or request timeout.";
      }
  }

  return new NewsApiError(
    message,
    status,
    code,
    retryAfter
  );
};

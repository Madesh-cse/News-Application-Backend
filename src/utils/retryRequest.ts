
import {createNewsApiError,isRetryableNewsApiError,} from "./newsApiErrorHandler.js";

interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
}

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const retryRequest = async <T>(request: () => Promise<T>,options: RetryOptions = {}): Promise<T> => {
  const {maxAttempts = 3, initialDelayMs = 500,} = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await request();
    } catch (error) {
      const shouldRetry = isRetryableNewsApiError(error);

      if (!shouldRetry || attempt === maxAttempts) {
        throw createNewsApiError(error);
      }
      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      console.warn("News API request failed. Retrying.", {
        attempt,
        nextAttempt: attempt + 1,
        delayMs: delay,
      });

      await wait(delay);
    }
  }

  throw new Error("News API request failed after all attempts.");
};

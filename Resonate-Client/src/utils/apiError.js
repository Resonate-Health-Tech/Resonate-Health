/**
 * Centralized API error formatter.
 * Emits toasts for network failures and server errors via sonner.
 *
 * Usage (in api.js):
 *   import { handleNetworkError, handleServerError } from "./utils/apiError";
 */
import { toast } from "sonner";

/**
 * Called on network-level failures (fetch threw, no response received).
 */
export function handleNetworkError(err) {
    const msg = navigator.onLine
        ? "Server is unreachable. Please try again."
        : "You appear to be offline. Check your connection.";

    toast.error("Network Error", {
        description: msg,
        duration: 5000,
    });
}

/**
 * Called when the server responds with a 5xx status code.
 * @param {number} status - HTTP status code
 * @param {string} [message] - Optional server message
 */
export function handleServerError(status, message) {
    const descriptions = {
        500: "Internal server error. The team has been notified.",
        502: "Bad gateway. The server is temporarily unavailable.",
        503: "Service unavailable. Please try again shortly.",
        504: "Request timed out. The server took too long to respond.",
    };

    toast.error(`Server Error (${status})`, {
        description: message || descriptions[status] || "An unexpected server error occurred.",
        duration: 5000,
    });
}

/**
 * Called when a rate limit (429) is hit.
 */
export function handleRateLimitError() {
    toast.warning("Too Many Requests", {
        description: "You're making requests too fast. Please slow down and try again.",
        duration: 6000,
    });
}

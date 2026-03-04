import axios from "axios";
import { handleNetworkError, handleServerError, handleRateLimitError } from "./utils/apiError.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure Axios to retry failed requests
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Rate limit hit
    if (response?.status === 429) {
      handleRateLimitError();
      return Promise.reject(error);
    }

    // Network errors or 5xx Server errors -> Retry Logic
    if (!response || response.status >= 500) {
      config._retryCount = config._retryCount || 0;

      // Do not retry file uploads (FormData)
      if (config.data instanceof FormData) {
        if (response) handleServerError(response.status);
        else handleNetworkError(error);
        return Promise.reject(error);
      }

      if (config._retryCount < 2) {
        config._retryCount += 1;
        // Exponential backoff
        await new Promise((r) => setTimeout(r, 500 * (2 ** (config._retryCount - 1))));
        return apiClient(config);
      } else {
        // Final attempt failed
        if (response) handleServerError(response.status);
        else handleNetworkError(error);
      }
    }

    return Promise.reject(error.response?.data?.message ? new Error(error.response.data.message) : error);
  }
);

// Wrapper that returns just the data (replacing await res.json())
const extractData = (promise) => promise.then(res => res.data);

export function postAuth(path, token, body) {
  return extractData(apiClient.post(path, body, {
    headers: { Authorization: `Bearer ${token}` }
  }));
}

export function getWithCookie(path) {
  return extractData(apiClient.get(path));
}

export function postWithCookie(path, body) {
  return extractData(apiClient.post(path, body));
}

export function putWithCookie(path, body) {
  return extractData(apiClient.put(path, body));
}

export function patchWithCookie(path, body) {
  return extractData(apiClient.patch(path, body));
}

export function uploadPdfWithCookie(path, file, category) {
  const formData = new FormData();
  formData.append("report", file);
  if (category) formData.append("category", category);

  return extractData(apiClient.post(path, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }));
}

export function analyzeFoodImage(file, cuisine) {
  const formData = new FormData();
  formData.append("image", file);
  if (cuisine) formData.append("cuisine", cuisine);

  return extractData(apiClient.post("/api/food/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }));
}

export function getFoodHistory() {
  return getWithCookie("/api/food/history");
}

export function createIntervention(body) {
  return postWithCookie("/api/interventions", body);
}

export function getActiveInterventions() {
  return getWithCookie("/api/interventions/active");
}

export function getAllInterventions() {
  return getWithCookie("/api/interventions");
}

export function suggestInterventions(body = {}) {
  return postWithCookie("/api/interventions/suggest", body);
}

export function getDailyInsights() {
  return getWithCookie("/api/insights/daily");
}

export function refreshInsights() {
  return postWithCookie("/api/insights/refresh", {});
}

export function stopIntervention(id, status = "discontinued", reason = null) {
  return patchWithCookie(`/api/interventions/${id}/stop`, { status, reason });
}

export function updateIntervention(id, body) {
  return putWithCookie(`/api/interventions/${id}`, body);
}

export function createDailyLog(body) {
  return postWithCookie("/api/daily-logs", body);
}

export function fetchWeeklyLogs() {
  return getWithCookie("/api/daily-logs/weekly");
}

export function getUserMemories(category) {
  return getWithCookie(`/api/user/memories${category ? `?category=${category}` : ""}`);
}

// Admin Dashboard APIs
export function fetchAdminStats() {
  return getWithCookie("/api/admin/dashboard/stats");
}

export function fetchAdminInsights() {
  return getWithCookie("/api/admin/dashboard/insights/recent");
}

export function fetchUserAdminMemory(userId) {
  return getWithCookie(`/api/admin/dashboard/user/${userId}`);
}

export function addMemoryManual(userId, body) {
  return postWithCookie(`/api/admin/memory/${userId}`, body);
}

export function deleteMemory(memoryId) {
  return extractData(apiClient.delete(`/api/admin/memory/${memoryId}`));
}

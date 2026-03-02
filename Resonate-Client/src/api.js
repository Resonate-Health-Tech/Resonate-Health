import { handleNetworkError, handleServerError, handleRateLimitError } from "./utils/apiError.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetch with exponential backoff retry.
 *
 * Retries on 5xx server errors and network failures (which can transiently
 * happen when the server is under high load at 1000 concurrent users).
 *
 * Retry schedule: 500ms → 1000ms (2 retries by default).
 * Upload endpoints (FormData) should use retries=0 to avoid double-uploads.
 */
async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);

      // Rate limit hit
      if (res.status === 429) {
        handleRateLimitError();
        return res;
      }

      // Server error — retry with backoff, then toast on final failure
      if (res.status >= 500) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
          continue;
        }
        // Final attempt failed — show toast
        handleServerError(res.status);
        return res;
      }

      return res;
    } catch (networkErr) {
      if (attempt === retries) {
        // Network completely failed after all retries
        handleNetworkError(networkErr);
        throw networkErr;
      }
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
}

export async function postAuth(path, token, body) {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function getWithCookie(path) {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function postWithCookie(path, body) {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function putWithCookie(path, body) {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function patchWithCookie(path, body) {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// File uploads — no retry (retries=0) to avoid processing the same file twice
export async function uploadPdfWithCookie(path, file, category) {
  const formData = new FormData();
  formData.append("report", file);
  if (category) formData.append("category", category);

  const res = await fetchWithRetry(
    `${BASE_URL}${path}`,
    { method: "POST", credentials: "include", body: formData },
    0 // no retry for uploads
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function analyzeFoodImage(file, cuisine) {
  const formData = new FormData();
  formData.append("image", file);
  if (cuisine) formData.append("cuisine", cuisine);

  const res = await fetchWithRetry(
    `${BASE_URL}/api/food/analyze`,
    { method: "POST", credentials: "include", body: formData },
    0 // no retry for uploads
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function getFoodHistory() {
  return getWithCookie("/api/food/history");
}

export async function createIntervention(body) {
  return postWithCookie("/api/interventions", body);
}

export async function getActiveInterventions() {
  return getWithCookie("/api/interventions/active");
}

export async function getAllInterventions() {
  return getWithCookie("/api/interventions");
}

export async function suggestInterventions(body = {}) {
  return postWithCookie("/api/interventions/suggest", body);
}

export async function stopIntervention(id, status = "discontinued", reason = null) {
  return patchWithCookie(`/api/interventions/${id}/stop`, { status, reason });
}

export async function updateIntervention(id, body) {
  return putWithCookie(`/api/interventions/${id}`, body);
}

export async function createDailyLog(body) {
  return postWithCookie("/api/daily-logs", body);
}

export async function fetchWeeklyLogs() {
  return getWithCookie("/api/daily-logs/weekly");
}

export async function getUserMemories(category) {
  return getWithCookie(`/api/user/memories${category ? `?category=${category}` : ""}`);
}

// Admin Dashboard APIs
export async function fetchAdminStats() {
  return getWithCookie("/api/admin/dashboard/stats");
}

export async function fetchAdminInsights() {
  return getWithCookie("/api/admin/dashboard/insights/recent");
}

export async function fetchUserAdminMemory(userId) {
  return getWithCookie(`/api/admin/dashboard/user/${userId}`);
}

export async function addMemoryManual(userId, body) {
  return postWithCookie(`/api/admin/memory/${userId}`, body);
}

export async function deleteMemory(memoryId) {
  const res = await fetchWithRetry(`${BASE_URL}/api/admin/memory/${memoryId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

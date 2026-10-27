const API_URL = import.meta.env.VITE_API_URL || "/api/leads";

async function request(path = "", options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Unable to reach the server. Check that the API is running.");
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    const error = new Error(body.message || "The request could not be completed.");
    error.status = response.status;
    error.fields = body.errors || {};
    throw error;
  }

  return body;
}

export function getLeads(filters, { signal } = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  return request(`?${params}`, { signal });
}

export function createLead(lead) {
  return request("", {
    method: "POST",
    body: JSON.stringify(lead),
  });
}

export function updateLeadStatus(id, status) {
  return request(`/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

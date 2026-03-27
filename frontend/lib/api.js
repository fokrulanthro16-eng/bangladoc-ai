const API_BASE = "http://localhost:5001/api";

export async function apiRequest(endpoint, method = "GET", body = null, token = null) {
    const isFormData = body instanceof FormData;

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}
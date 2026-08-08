const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6673/api";

export async function request(path: string, options: RequestInit = {}) {
  let token: string | null = null;
  
  if (typeof window !== "undefined") {
    // Try to get token from localStorage directly or from zustand persist
    token = localStorage.getItem("ekraf-token");
    if (!token) {
      const authPersist = localStorage.getItem("ekraf-auth");
      if (authPersist) {
        try {
          const parsed = JSON.parse(authPersist);
          token = parsed.state?.token || null;
        } catch (e) {
          // ignore
        }
      }
    }
  }

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid — clear auth state so guards can redirect.
    // Imported lazily to avoid a circular import at module load.
    try {
      const { useAuth } = await import("./auth");
      useAuth.getState().logout();
    } catch {
      /* ignore */
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : errorData.message || `Request failed with status ${response.status}`;
    throw new Error(msg);
  }

  // Envelope standar: { success, message, data, meta? } — return .data langsung
  const json = await response.json();
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return json.data;
  }
  return json;
}

export const api = {
  get: (path: string) => request(path, { method: "GET" }),
  post: (path: string, body: any) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: any) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: "DELETE" }),
  postFormData: (path: string, formData: FormData) => request(path, { method: "POST", body: formData }),
};

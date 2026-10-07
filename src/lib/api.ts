const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6670/api";

export async function request(path: string, options: RequestInit = {}) {
  let token: string | null = null;
  
  if (typeof window !== "undefined") {
    // Try to get token from localStorage directly or from zustand persist
    token = localStorage.getItem("pasarjaya-token");
    if (!token) {
      const authPersist = localStorage.getItem("pasarjaya-auth");
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
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return unwrapEnvelope(await response.json());
}

/**
 * Backend (sejak migrasi envelope) membungkus semua respons sukses:
 *   { success: true, message, data, meta? }
 * - List paginated { data: [...], meta: { total, page, limit, totalPages } }
 *   → dikembalikan ke bentuk lama { items, total, page, limit, totalPages }
 * - Selain itu → kembalikan `data` apa adanya (array / objek).
 * Bentuk lama (tanpa envelope) diteruskan tanpa perubahan.
 */
export function unwrapEnvelope(json: any) {
  if (
    json &&
    typeof json === "object" &&
    !Array.isArray(json) &&
    "success" in json &&
    "data" in json
  ) {
    const data = (json as any).data;
    const meta = (json as any).meta;
    if (Array.isArray(data) && meta && typeof meta === "object") {
      return {
        items: data,
        total: meta.total ?? data.length,
        page: meta.page ?? 1,
        limit: meta.limit ?? data.length,
        totalPages: meta.totalPages ?? 1,
      };
    }
    return data;
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

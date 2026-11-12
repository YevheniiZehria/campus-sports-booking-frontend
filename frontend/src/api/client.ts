import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

// Middleware pentru atașarea automată a token-ului JWT și tratarea răspunsurilor 401
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = sessionStorage.getItem("usv_token");
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      // Dacă primim 401, curățăm tokenul și redirecționăm către autentificare dacă nu suntem deja pe o rută publică
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/inregistrare") &&
        !window.location.pathname.startsWith("/parola-uitata")
      ) {
        sessionStorage.removeItem("usv_token");
        sessionStorage.removeItem("usv_user");
        window.location.href = "/login?expirat=1";
      }
    }
    return response;
  },
};

/**
 * Clientul HTTP tipizat generat pe baza specificației OpenAPI.
 */
export const api = createClient<paths>({
  baseUrl: API_BASE_URL,
});

api.use(authMiddleware);

export default api;

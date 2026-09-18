import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "";

export const apiClient = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : "/api",
});

// Anexa o token JWT (se existir) em toda requisicao.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o backend responder 401 (token invalido/expirado), limpa a sessao local
// e manda o usuario de volta para o login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

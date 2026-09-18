import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute() {
  const { usuario, carregando } = useAuth();

  if (carregando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role !== "ADMIN") return <Navigate to="/perfil" replace />;

  return <Outlet />;
}

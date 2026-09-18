import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AdminRoute } from "./routes/AdminRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PerfilPage } from "./pages/PerfilPage";
import { AdminUsuariosPage } from "./pages/AdminUsuariosPage";

function RaizRedirect() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? "/perfil" : "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RaizRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrar" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<PerfilPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
            <Route path="/admin/usuarios/:id" element={<PerfilPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

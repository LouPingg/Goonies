import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({ children, admin = false }) {
  const { loading, user, isAdmin } = useAuth();

  if (loading) return <div style={{ padding: 24, textAlign: "center" }}>Chargement…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
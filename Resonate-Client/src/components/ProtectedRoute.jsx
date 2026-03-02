import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const verified = sessionStorage.getItem("verifiedUser");

  if (!verified) return <Navigate to="/login" />;

  return children;
}


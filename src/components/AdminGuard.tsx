import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

export default function AdminGuard({ children }: Props) {
  const token = localStorage.getItem("BI_ADMIN_TOKEN");

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

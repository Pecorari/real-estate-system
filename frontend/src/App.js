import { AuthProvider } from "./context/authContext";
import AppRoutes from "./router/routes";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

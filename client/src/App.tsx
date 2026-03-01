import { AppRoutes } from "./router";
import { AuthProvider } from "./shared/AuthContext";

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}


import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login-page";
import LoginSuccess from "@/pages/login-success";
import RegisterPage from "@/pages/register-page";
import Dashboard from "@/pages/dashboard";
import AdminPage from "@/pages/admin-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import { AuthProvider } from "@/context/auth-context";

function Router() {
  return (
    <Switch>
      {/* rota raiz — mostra a LoginPage */}
      <Route path="/" component={LoginPage} />

      {/* rota explícita caso queira usar /login também */}
      <Route path="/login" component={LoginPage} />

      <Route path="/login/success" component={LoginSuccess} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/settings" component={SettingsPage} />

      {/* fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;

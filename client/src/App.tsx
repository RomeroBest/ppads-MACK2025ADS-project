import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import Dashboard from "@/pages/dashboard";
import AdminPage from "@/pages/admin-page";
import { AuthProvider } from "@/context/auth-context";
import LoginSuccessPage from "@/pages/LoginSuccessPage"; // ajuste se necessário


function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/login-success" component={LoginSuccessPage} /> {/* ✅ ESTA LINHA */}
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


<Route path="/login-success" component={LoginSuccessPage} />

export default App;

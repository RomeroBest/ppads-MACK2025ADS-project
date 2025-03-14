import { useEffect } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/login";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return <LoginForm />;
}

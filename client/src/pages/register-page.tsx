import { useEffect } from "react";
import { useLocation } from "wouter";
import { RegisterForm } from "@/components/register";
import { useAuth } from "@/context/auth-context";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return <RegisterForm />;
}
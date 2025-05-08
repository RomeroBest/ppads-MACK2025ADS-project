// src/pages/LoginSuccess.tsx
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function LoginSuccess() {
  const [, navigate] = useLocation(); // usamos só navigate

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      setLocation("/dashboard");
    } else {
      setLocation("/login");
    }
  }, []);

  return <p>Redirecionando…</p>;
}

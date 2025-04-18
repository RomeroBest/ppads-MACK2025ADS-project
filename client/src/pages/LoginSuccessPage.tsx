import { useEffect } from "react";
import { useLocation } from "wouter";

const LoginSuccessPage = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      setLocation("/dashboard"); // redireciona após login
    } else {
      setLocation("/"); // volta pro login se token inválido
    }
  }, []);

  return (
    <div className="p-4 text-center">
      <p>Logando com Google...</p>
    </div>
  );
};

export default LoginSuccessPage;

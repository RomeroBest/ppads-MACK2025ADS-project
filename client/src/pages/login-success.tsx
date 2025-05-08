import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoginSuccess() {
  const [_, setLocation] = useLocation();
  const { login } = useAuth();
  
  useEffect(() => {
    // Parse user data from query params
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id") || "");
    const email = params.get("email") || "";
    const name = params.get("name") || "";
    const username = params.get("username") || "";
    const role = params.get("role") || "user";
    const profilePicture = params.get("profilePicture") || null;
    
    if (id && email && name && username) {
      // Log the user in with the data from the URL
      login({
        id,
        email,
        name,
        username,
        role,
        profilePicture
      });
      
      // Redirect to dashboard after a short delay
          setLocation("/dashboard", /* opcional: { replace: true } */);
        } else {
          console.error("Parâmetros de login ausentes.");
        }
    }, [login, setLocation]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Login Successful</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary my-4" />
          <p className="text-center text-muted-foreground">
            You've successfully logged in with Google.
            <br />
            Redirecting you to the dashboard...
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            className="w-full" 
            onClick={() => setLocation("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
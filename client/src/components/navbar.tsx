import { useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ClipboardList, ShieldCheck, Home } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <ClipboardList className="h-8 w-auto text-primary" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                TaskFlow
              </span>
            </div>

            {user && (
              <div className="ml-6 flex space-x-4">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setLocation("/dashboard")}
                >
                  <Home className="h-5 w-5 mr-1" />
                  Dashboard
                </Button>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => setLocation("/admin")}
                  >
                    <ShieldCheck className="h-5 w-5 mr-1" />
                    Admin
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <span className="sr-only">Open user menu</span>
                    <Avatar className="h-8 w-8">
                      {user.profilePicture ? (
                        <AvatarImage
                          src={user.profilePicture}
                          alt={user.name}
                        />
                      ) : (
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="ml-2 text-gray-700">{user.name}</span>
                    <svg
                      className="ml-1 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {isAdmin && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => setLocation("/admin")}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Your Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

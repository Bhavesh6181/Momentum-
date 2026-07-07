import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuthStore } from "../../store/authStore";

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 select-none"
      aria-label="Global Navigation"
    >
      <Link
        to="/"
        className="text-headline-md font-bold tracking-tighter text-on-surface hover:opacity-80 transition-opacity"
      >
        Momentum
      </Link>
      <div className="flex gap-gutter items-center">
        <Link
          to="/dashboard"
          className="hidden md:inline text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
        >
          Dashboard
        </Link>
        <Link
          to="/groups"
          className="hidden md:inline text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
        >
          Study Rooms
        </Link>
        <Link
          to="/analytics"
          className="hidden md:inline text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
        >
          Analytics
        </Link>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAction}
          className="ml-4 font-semibold hover:scale-95 transition-transform"
        >
          {isAuthenticated ? "Go to Console" : "Join Session"}
        </Button>
      </div>
    </nav>
  );
};

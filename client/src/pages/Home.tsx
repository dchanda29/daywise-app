import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/profiles", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );
}

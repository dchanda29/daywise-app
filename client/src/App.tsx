import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProfilePicker from "./pages/ProfilePicker";
import Questionnaire from "./pages/Questionnaire";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/profiles"} component={ProfilePicker} />
      <Route path={"/questionnaire/:profileId"} component={Questionnaire} />
      <Route path={"/dashboard/:profileId"} component={Dashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

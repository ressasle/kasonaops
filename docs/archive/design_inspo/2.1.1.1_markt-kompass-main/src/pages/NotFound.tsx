import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <Compass className="h-24 w-24 text-accent mx-auto mb-6 animate-pulse" />
        <h1 className="font-anton text-6xl mb-4 text-primary">404</h1>
        <h2 className="font-abril text-2xl mb-4">Seite nicht gefunden</h2>
        <p className="text-muted-foreground mb-8">
          Die gesuchte Seite existiert leider nicht.
        </p>
        <Button onClick={() => navigate("/dashboard")} size="lg">
          <Home className="h-5 w-5 mr-2" />
          Zurück zur Startseite
        </Button>
      </div>
    </div>
  );
};

export default NotFound;


import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background page-transition">
      <div className="container px-4 md:px-6 flex flex-col items-center text-center">
        <div className="rounded-full bg-spatioo-green/10 p-4 mb-6">
          <MapPin className="h-10 w-10 text-spatioo-green" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
          Page Not Found
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mb-8">
          We couldn't find the page you were looking for. The location might be incorrect, or the page may have been moved or deleted.
        </p>
        <Button asChild className="bg-spatioo-green hover:bg-spatioo-green-dark text-white button-hover">
          <Link to="/">
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

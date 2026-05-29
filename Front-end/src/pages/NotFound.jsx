import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[rgb(73,129,96)] via-[rgb(91,108,75)] to-[rgb(109,87,54)]">
      <div className="max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl text-white">
        <div className="text-center space-y-6">
          <div className="relative">
            <h1 className="text-[150px] font-extrabold text-white/10 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold animate-fade-in">
                  Page Not Found
                </h2>
                <p className="text-white/80 animate-fade-in animation-delay-200">
                  Oops! The page you're looking for doesn't exist or has been
                  moved.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-fade-in animation-delay-400">
            <Button
              variant="secondary"
              className="w-full sm:w-auto group transition-all duration-300 hover:scale-105"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </Button>
            <Link to="/" className="w-full sm:w-auto">
              <Button
                className="w-full group transition-all duration-300 hover:scale-105"
                variant="default"
              >
                <Home className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

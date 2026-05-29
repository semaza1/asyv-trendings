import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import logo from "@/assets/asyv.png";

// API base URL - adjust according to your backend configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Store user data and token in localStorage
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem(
          "userData",
          JSON.stringify({
            _id: data.data._id,
            fullName: data.data.fullName,
            email: data.data.email,
            role: data.data.role,
            field: data.data.field, // Include field for students
            department: data.data.department, // Include department for ASYV Items users
            customDepartment: data.data.customDepartment, // Include custom department
          }),
        );

        // Redirect based on role
        const from = location.state?.from?.pathname || null;
        if (from) {
          navigate(from, { replace: true });
        } else if (data.data.role === "asyv-items") {
          // ASYV Items users go directly to IT Items page
          navigate("/admin/it-items", { replace: true });
        } else if (data.data.role === "admin" || data.data.role === "student") {
          // Admin and students go to dashboard
          navigate("/admin", { replace: true });
        } else {
          // Other roles not supported
          setError("Access denied. Valid account required.");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      } else {
        setError(
          data.message ||
            "Login failed. Please check your credentials and try again.",
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Connection error. Please check your internet connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home */}
        <Link
          to="/"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Login Card */}
        <Card className="border-primary/20 shadow-hero">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <img
                src={logo}
                alt="ASYV Logo"
                className="h-16 w-18 object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Content Management Login
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Access the ASYV Trendings content management system
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className="h-11 pr-10"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-primary text-primary-foreground shadow-card"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground pb-4">
              If you don't have an account,{" "}
              <strong>Contact Administrator</strong>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ASYV Trendings. Secure admin access.</p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Save, Loader2 } from "lucide-react";
import { getAuthToken } from "@/utils/auth";

const SettingsPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [currentPasswordServerError, setCurrentPasswordServerError] =
    useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        console.log("Fetching profile with token:", token);
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        console.log("Profile fetch response:", data);
        if (data.success && data.data) {
          setFormData((prev) => ({
            ...prev,
            name: data.data.fullName || "",
            email: data.data.email || "",
          }));
        } else {
          setError(data.message || "Failed to load profile");
          toast({
            title: "Error",
            description: data.message || "Failed to load profile",
            variant: "destructive",
          });
        }
      } catch (err) {
        setError("Failed to load profile");
        console.error("Profile fetch error:", err);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (field, value) => {
    if (field === "currentPassword") setCurrentPasswordServerError("");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setUpdatingProfile(true);
    try {
      const token = getAuthToken();
      console.log("Saving profile with:", formData, "token:", token);
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
        }),
      });
      const data = await res.json();
      console.log("Save profile response:", data);
      if (data.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Save profile error:", err);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const canChangePassword =
    !!formData.currentPassword &&
    formData.newPassword.length >= 6 &&
    formData.newPassword === formData.confirmPassword;

  // Password validation messages
  const currentPasswordError = !formData.currentPassword
    ? "Current password is required."
    : "";
  const newPasswordError =
    formData.newPassword && formData.newPassword.length < 6
      ? "New password must be at least 6 characters."
      : "";
  const confirmPasswordError =
    formData.newPassword &&
    formData.confirmPassword &&
    formData.newPassword !== formData.confirmPassword
      ? "Passwords do not match."
      : "";

  const handleChangePassword = async () => {
    if (!formData.currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required.",
        variant: "destructive",
      });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    setUpdatingPassword(true);
    try {
      const token = getAuthToken();
      console.log("Changing password with token:", token);
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: formData.newPassword,
          currentPassword: formData.currentPassword,
        }),
      });
      const data = await res.json();
      console.log("Change password response:", data);
      if (data.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setCurrentPasswordServerError("");
      } else {
        // If backend error is about current password, show it under the field
        if (
          data.message &&
          data.message.toLowerCase().includes("current password")
        ) {
          setCurrentPasswordServerError(data.message);
        }
        toast({
          title: "Error",
          description: data.message || "Failed to update password",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Change password error:", err);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {loading && (
        <div className="text-center text-muted-foreground">
          Loading profile...
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 font-semibold">{error}</div>
      )}

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  disabled={loading || updatingProfile}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading || updatingProfile}
                />
              </div>
            </div>
            <Button
              onClick={handleSaveProfile}
              className="w-fit"
              disabled={loading || updatingProfile}
            >
              {updatingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                placeholder="Enter your current password"
                disabled={loading || updatingPassword}
              />

              {formData.currentPassword === "" && (
                <div className="text-red-500 text-sm mt-1">
                  {currentPasswordError}
                </div>
              )}
              {currentPasswordServerError && (
                <div className="text-red-500 text-sm mt-1">
                  {currentPasswordServerError}
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  placeholder="Enter new password"
                  disabled={loading || updatingPassword}
                />

                {newPasswordError && (
                  <div className="text-red-500 text-sm mt-1">
                    {newPasswordError}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm new password"
                  disabled={loading || updatingPassword}
                />

                {confirmPasswordError && (
                  <div className="text-red-500 text-sm mt-1">
                    {confirmPasswordError}
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              className="w-fit"
              disabled={loading || updatingPassword || !canChangePassword}
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;

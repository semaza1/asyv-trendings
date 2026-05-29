import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Lock,
  Shield,
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Monitor,
} from "lucide-react";

const AddEditUserModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  fieldOptions,
}) => {
  const isEditing = Boolean(initialData);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "student",
    field: "",
    department: "",
    customDepartment: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          fullName: initialData.fullName,
          email: initialData.email,
          role: initialData.role,
          field: initialData.field || "",
          department: initialData.department || "",
          customDepartment: initialData.customDepartment || "",
        });
      } else {
        setFormData({
          fullName: "",
          email: "",
          role: "student",
          field: "",
          department: "",
          customDepartment: "",
        });
      }
      setPassword("");
      setConfirmPassword("");
      setErrors({});
      setShowPassword(false);
    }
  }, [open, initialData]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isEditing) {
      if (!password.trim()) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (password && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (formData.role === "student" && !formData.field) {
      newErrors.field = "Field is required for students";
    }

    if (formData.role === "asyv-items" && !formData.department) {
      newErrors.department = "Department is required for ASYV Items users";
    }

    if (
      formData.role === "asyv-items" &&
      formData.department === "custom" &&
      !formData.customDepartment
    ) {
      newErrors.customDepartment = "Custom department name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = { ...formData };
      // Only include password if it's provided
      if (password.trim()) {
        submitData.password = password;
      }

      // Remove field if role is admin or asyv-items
      if (formData.role === "admin" || formData.role === "asyv-items") {
        delete submitData.field;
      }

      // Remove department if role is not asyv-items
      if (formData.role !== "asyv-items") {
        delete submitData.department;
        delete submitData.customDepartment;
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "password") {
      setPassword(value);
    } else if (field === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field when role changes to admin or asyv-items
      if (field === "role" && value === "admin") {
        setFormData((prev) => ({
          ...prev,
          field: "",
          department: "",
          customDepartment: "",
        }));
      }
      // Clear department when role changes to student or admin
      if (field === "role" && (value === "student" || value === "admin")) {
        setFormData((prev) => ({
          ...prev,
          department: "",
          customDepartment: "",
        }));
      }
      // Clear field when role changes to asyv-items
      if (field === "role" && value === "asyv-items") {
        setFormData((prev) => ({ ...prev, field: "" }));
      }
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {isEditing ? (
                <User className="h-5 w-5" />
              ) : (
                <GraduationCap className="h-5 w-5" />
              )}
            </div>
            {isEditing ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information and permissions"
              : "Create a new user account with appropriate role and permissions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName || ""}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter full name"
                    className={`${errors.fullName ? "border-destructive focus:border-destructive" : ""}`}
                  />

                  {errors.fullName && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.fullName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      className={`pl-10 ${errors.email ? "border-destructive focus:border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Security</h3>
                {isEditing && (
                  <Badge variant="outline" className="text-xs">
                    Leave blank to keep current password
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password{" "}
                    {!isEditing && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder={
                        isEditing
                          ? "Enter new password (optional)"
                          : "Enter password"
                      }
                      className={`pl-10 pr-10 ${errors.password ? "border-destructive focus:border-destructive" : ""}`}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm Password{" "}
                    {!isEditing && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirm password"
                      className={`pl-10 ${errors.confirmPassword ? "border-destructive focus:border-destructive" : ""}`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Role & Permissions
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    User Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.role || ""}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger
                      className={`${errors.role ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-600" />
                          <span>Administrator</span>
                          <Badge variant="secondary" className="text-xs">
                            Full Access
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="asyv-items">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-green-600" />
                          <span>ASYV Items</span>
                          <Badge variant="secondary" className="text-xs">
                            IT Items Only
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          <span>Student</span>
                          <Badge variant="outline" className="text-xs">
                            Limited Access
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.role}
                    </div>
                  )}
                </div>

                {formData.role === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="field" className="text-sm font-medium">
                      Assigned Field <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.field || ""}
                      onValueChange={(value) =>
                        handleInputChange("field", value)
                      }
                    >
                      <SelectTrigger
                        className={`${errors.field ? "border-destructive" : ""}`}
                      >
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.field && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {errors.field}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Department Selection for ASYV Items */}
              {formData.role === "asyv-items" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.department || ""}
                      onValueChange={(value) =>
                        handleInputChange("department", value)
                      }
                    >
                      <SelectTrigger
                        className={`${errors.department ? "border-destructive" : ""}`}
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="L&P">L&P</SelectItem>
                        <SelectItem value="HLD">HLD</SelectItem>
                        <SelectItem value="PW">PW</SelectItem>
                        <SelectItem value="School">School</SelectItem>
                        <SelectItem value="LEAP">LEAP</SelectItem>
                        <SelectItem value="ILC">ILC</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="FINANCE">FINANCE</SelectItem>
                        <SelectItem value="ADMINISTRATION">
                          ADMINISTRATION
                        </SelectItem>
                        <SelectItem value="All Departments">
                          All Departments
                        </SelectItem>
                        <SelectItem value="custom">
                          Other (Custom Department)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {errors.department}
                      </div>
                    )}
                  </div>

                  {formData.department === "custom" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="customDepartment"
                        className="text-sm font-medium"
                      >
                        Custom Department Name{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customDepartment"
                        value={formData.customDepartment || ""}
                        onChange={(e) =>
                          handleInputChange("customDepartment", e.target.value)
                        }
                        placeholder="Enter custom department name"
                        className={`${errors.customDepartment ? "border-destructive focus:border-destructive" : ""}`}
                      />

                      {errors.customDepartment && (
                        <div className="flex items-center gap-1 text-sm text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {errors.customDepartment}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Role Description */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      {formData.role === "admin"
                        ? "Administrator Privileges"
                        : formData.role === "asyv-items"
                          ? "ASYV Items Privileges"
                          : "Student Privileges"}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      {formData.role === "admin"
                        ? "Full access to all content management features, user management, and system settings."
                        : formData.role === "asyv-items"
                          ? `Access to ASYV Items management only. Can view, create, edit, and delete IT items and device actions for ${formData.department === "All Departments" ? "all departments" : formData.department === "custom" ? formData.customDepartment || "the assigned" : formData.department || "the assigned"} department${formData.department !== "All Departments" ? "" : "s"}. No access to other sections.`
                          : `Access to manage content in the ${formData.field ? fieldOptions.find((f) => f.value === formData.field)?.label : "assigned"} section only.`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update User" : "Create User"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditUserModal;

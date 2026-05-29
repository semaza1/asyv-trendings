import React, { useState, useEffect } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Calendar,
  Network,
  Settings,
  AlertCircle,
  CheckCircle2,
  Plus,
  FileSpreadsheet,
  MapPin,
  User,
  XCircle,
  Gauge,
  AlertTriangle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { getUserData } from "@/utils/auth";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";

// Storage keys for location and staff suggestions
const LOCATION_STORAGE_KEY = "customLocations";
const STAFF_STORAGE_KEY = "customStaff";

const STORAGE_KEY = "customDepartments";

// Helper functions for localStorage
const getStoredDepartments = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const departments = stored ? JSON.parse(stored) : [];
    // Filter out any "custom" entries to prevent key conflicts
    return departments.filter((dept) => dept.toLowerCase() !== "custom");
  } catch (error) {
    console.error("Error reading custom departments:", error);
    return [];
  }
};

const saveCustomDepartment = (department) => {
  try {
    const departments = getStoredDepartments();
    const normalizedDept = department.toLowerCase();
    // Don't save "custom" as it's reserved
    if (normalizedDept === "custom") {
      console.warn(
        'Cannot save "custom" as a department name - it is reserved',
      );
      return;
    }
    // Check if department already exists (case-insensitive)
    const exists = departments.some(
      (dept) => dept.toLowerCase() === normalizedDept,
    );
    if (!exists) {
      departments.push(department);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
    }
  } catch (error) {
    console.error("Error saving custom department:", error);
  }
};

// Helper functions for location suggestions
const getStoredLocations = () => {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading stored locations:", error);
    return [];
  }
};

const saveLocationSuggestion = (location) => {
  try {
    const locations = getStoredLocations();
    const normalizedLocation = location.trim();
    if (normalizedLocation && !locations.includes(normalizedLocation)) {
      locations.push(normalizedLocation);
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locations));
    }
  } catch (error) {
    console.error("Error saving location suggestion:", error);
  }
};

const deleteLocationSuggestion = (location) => {
  try {
    const locations = getStoredLocations();
    const updatedLocations = locations.filter((loc) => loc !== location);
    localStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify(updatedLocations),
    );
  } catch (error) {
    console.error("Error deleting location suggestion:", error);
  }
};

// Helper functions for staff suggestions
const getStoredStaff = () => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading stored staff:", error);
    return [];
  }
};

const saveStaffSuggestion = (staff) => {
  try {
    const staffList = getStoredStaff();
    const normalizedStaff = staff.trim();
    if (normalizedStaff && !staffList.includes(normalizedStaff)) {
      staffList.push(normalizedStaff);
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffList));
    }
  } catch (error) {
    console.error("Error saving staff suggestion:", error);
  }
};

const deleteStaffSuggestion = (staff) => {
  try {
    const staffList = getStoredStaff();
    const updatedStaff = staffList.filter((s) => s !== staff);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
  } catch (error) {
    console.error("Error deleting staff suggestion:", error);
  }
};

const AddEditITItemModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  typeOptions,
  onImportClick,
}) => {
  const isEditing = Boolean(initialData);
  const [formData, setFormData] = useState({
    itemName: "",
    type: "",
    model: "",
    purchasedDate: "",
    serialNumber: "",
    macAddress: "",
    status: "working",
    operationStatus: "working well",
    assignmentType: "location",
    location: "",
    department: "",
  });
  const [customType, setCustomType] = useState("");
  const [showCustomType, setShowCustomType] = useState(false);
  const [customDepartment, setCustomDepartment] = useState("");
  const [showCustomDepartment, setShowCustomDepartment] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDepartments, setCustomDepartments] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [staffSuggestions, setStaffSuggestions] = useState([]);
  const [locationComboOpen, setLocationComboOpen] = useState(false);

  // Load custom departments from localStorage on mount and clean up any unwanted entries
  useEffect(() => {
    const departments = getStoredDepartments();
    const predefinedDepts = [
      "it",
      "l&p",
      "hld",
      "pw",
      "school",
      "leap",
      "ilc",
      "hr",
      "finance",
      "administration",
    ];
    // Clean up: Remove "custom" entries and any predefined departments that might be stored
    const cleanDepartments = departments.filter((dept) => {
      const deptLower = dept.toLowerCase();
      return deptLower !== "custom" && !predefinedDepts.includes(deptLower);
    });
    if (cleanDepartments.length !== departments.length) {
      // If we filtered out any entries, update localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanDepartments));
      } catch (error) {
        console.error("Error cleaning custom departments:", error);
      }
    }
    setCustomDepartments(cleanDepartments);
  }, []);

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          itemName: initialData.itemName,
          type: initialData.type,
          model: initialData.model || "",
          purchasedDate: initialData.purchasedDate,
          serialNumber: initialData.serialNumber || "",
          macAddress: initialData.macAddress || "",
          status: initialData.status,
          operationStatus: initialData.operationStatus || "working well",
          assignmentType: initialData.assignmentType || "location",
          location: initialData.location,
          department: initialData.department || "",
        });
        // Check if type is custom (not in predefined options)
        const isCustomTypeValue =
          !typeOptions.some((option) => option.value === initialData.type) &&
          initialData.type !== "photocopy machine";
        setShowCustomType(isCustomTypeValue);
        if (isCustomTypeValue) {
          setCustomType(initialData.type);
        }
        // Check if department is custom
        const predefinedDepts = [
          "it",
          "l&p",
          "hld",
          "pw",
          "school",
          "leap",
          "ilc",
          "hr",
          "finance",
          "administration",
        ];
        const storedCustomDepts = getStoredDepartments().map((d) =>
          d.toLowerCase(),
        );
        const allKnownDepts = [...predefinedDepts, ...storedCustomDepts];
        const isCustomDept =
          initialData.department &&
          !allKnownDepts.includes(initialData.department.toLowerCase());
        setShowCustomDepartment(isCustomDept);
        if (isCustomDept) {
          setCustomDepartment(initialData.department);
        }
      } else {
        // Get current user data to set default department
        const userData = getUserData();
        let defaultDepartment = "";
        // For ASYV Items users with specific department, set their department as default
        if (
          userData?.role === "asyv-items" &&
          userData.department &&
          userData.department !== "All Departments"
        ) {
          defaultDepartment =
            userData.department === "custom"
              ? userData.customDepartment || ""
              : userData.department;
        }
        setFormData({
          itemName: "",
          type: "",
          model: "",
          purchasedDate: "",
          serialNumber: "",
          macAddress: "",
          status: "working",
          operationStatus: "working well",
          assignmentType: "location",
          location: "",
          department: defaultDepartment,
        });
        setShowCustomType(false);
        setCustomType("");
        setShowCustomDepartment(false);
        setCustomDepartment("");
      }
      setErrors({});
    }
  }, [open, initialData, typeOptions]);

  // Load location and staff suggestions when modal opens
  useEffect(() => {
    if (open) {
      loadLocationSuggestions();
    }
  }, [open]);

  // Ensure department is set correctly for ASYV Items users
  useEffect(() => {
    if (open && !initialData) {
      const userData = getUserData();
      if (
        userData?.role === "asyv-items" &&
        userData.department &&
        userData.department !== "All Departments"
      ) {
        const userDepartment =
          userData.department === "custom"
            ? userData.customDepartment
            : userData.department;
        if (userDepartment && formData.department !== userDepartment) {
          setFormData((prev) => ({ ...prev, department: userDepartment }));
        }
      }
    }
  }, [open, initialData, formData.department]);

  // Function to load location and staff suggestions from existing items and localStorage
  const loadLocationSuggestions = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/it-items`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Get stored suggestions from localStorage
      const storedLocations = getStoredLocations();
      const storedStaff = getStoredStaff();

      if (response.ok) {
        const result = await response.json();
        const items = result.data || [];

        // Extract unique locations for location assignments
        const dbLocations = new Set();
        const dbStaff = new Set();

        items.forEach((item) => {
          if (item.location && item.location.trim()) {
            if (item.assignmentType === "location" || !item.assignmentType) {
              dbLocations.add(item.location.trim());
            } else if (item.assignmentType === "staff") {
              dbStaff.add(item.location.trim());
            }
          }
        });

        // Merge database suggestions with stored suggestions
        const allLocations = new Set([
          ...Array.from(dbLocations),
          ...storedLocations,
        ]);
        const allStaff = new Set([...Array.from(dbStaff), ...storedStaff]);

        setLocationSuggestions(Array.from(allLocations).sort());
        setStaffSuggestions(Array.from(allStaff).sort());
      } else {
        // If API fails, use only stored suggestions
        setLocationSuggestions(storedLocations.sort());
        setStaffSuggestions(storedStaff.sort());
      }
    } catch (error) {
      console.error("Error loading location suggestions:", error);
      // Fallback to stored suggestions if API fails
      setLocationSuggestions(getStoredLocations().sort());
      setStaffSuggestions(getStoredStaff().sort());
    }
  };

  // Function to delete a suggestion from the list
  const handleDeleteSuggestion = (suggestionToDelete) => {
    if (formData.assignmentType === "staff") {
      deleteStaffSuggestion(suggestionToDelete);
      setStaffSuggestions((prev) =>
        prev.filter((suggestion) => suggestion !== suggestionToDelete),
      );
    } else {
      deleteLocationSuggestion(suggestionToDelete);
      setLocationSuggestions((prev) =>
        prev.filter((suggestion) => suggestion !== suggestionToDelete),
      );
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName?.trim()) {
      newErrors.itemName = "Item name is required";
    }

    if (!formData.type && !showCustomType) {
      newErrors.type = "Item type is required";
    }

    if (showCustomType && !customType.trim()) {
      newErrors.customType = "Custom type is required";
    }

    if (!formData.purchasedDate) {
      newErrors.purchasedDate = "Purchase date is required";
    } else {
      const purchaseDate = new Date(formData.purchasedDate);
      const today = new Date();
      if (purchaseDate > today) {
        newErrors.purchasedDate = "Purchase date cannot be in the future";
      }
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.assignmentType) {
      newErrors.assignmentType = "Assignment type is required";
    }

    if (!formData.location?.trim()) {
      newErrors.location =
        formData.assignmentType === "staff"
          ? "Staff name is required"
          : "Location is required";
    }

    if (!formData.department && !showCustomDepartment) {
      newErrors.department = "Department is required";
    }

    if (showCustomDepartment && !customDepartment.trim()) {
      newErrors.customDepartment = "Custom department is required";
    }

    // Validate MAC address format if provided
    if (formData.macAddress && formData.macAddress.trim()) {
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(formData.macAddress)) {
        newErrors.macAddress =
          "Invalid MAC address format (e.g., 00:1B:44:11:3A:B7)";
      }
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
      // Use custom type if selected
      if (showCustomType && customType.trim()) {
        submitData.type = customType.trim().toLowerCase();
      }

      // Use custom department if selected
      if (showCustomDepartment && customDepartment.trim()) {
        const deptValue = customDepartment.trim();
        submitData.department = deptValue;
        // Save to localStorage for future use
        saveCustomDepartment(deptValue);
        // Update local state
        setCustomDepartments(getStoredDepartments());
      }

      // Clean up MAC address
      if (submitData.macAddress) {
        submitData.macAddress = submitData.macAddress.trim();
      }

      // Save location/staff suggestion to localStorage for future use
      if (submitData.location && submitData.location.trim()) {
        if (submitData.assignmentType === "staff") {
          saveStaffSuggestion(submitData.location.trim());
        } else {
          saveLocationSuggestion(submitData.location.trim());
        }
      }

      await onSubmit(submitData);
      // Refresh location suggestions after successful submission
      loadLocationSuggestions();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "customType") {
      setCustomType(value);
    } else if (field === "customDepartment") {
      setCustomDepartment(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTypeChange = (value) => {
    if (value === "custom") {
      setShowCustomType(true);
      setFormData((prev) => ({ ...prev, type: "" }));
    } else {
      setShowCustomType(false);
      setCustomType("");
      setFormData((prev) => ({ ...prev, type: value }));
    }
    // Clear error
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: "" }));
    }
  };

  const handleDepartmentChange = (value) => {
    if (value === "custom") {
      setShowCustomDepartment(true);
      setFormData((prev) => ({ ...prev, department: "" }));
    } else {
      setShowCustomDepartment(false);
      setCustomDepartment("");
      setFormData((prev) => ({ ...prev, department: value }));
    }
    if (errors.department) {
      setErrors((prev) => ({ ...prev, department: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {isEditing ? (
                    <Settings className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </div>
                {isEditing ? "Edit ASYV Item" : "Add New ASYV Item"}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {isEditing
                  ? "Update the ASYV item information and status"
                  : "Add a new ASYV item to the inventory with all necessary details"}
              </DialogDescription>
            </div>

            {!isEditing && onImportClick && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onImportClick();
                }}
                className="border-2 border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-800 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                Import Excel/CSV
              </Button>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="itemName" className="text-sm font-medium">
                    Item Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="itemName"
                    value={formData.itemName || ""}
                    onChange={(e) =>
                      handleInputChange("itemName", e.target.value)
                    }
                    placeholder="e.g., Dell Laptop - Marketing Department"
                    className={`border-2 ${errors.itemName ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                  />

                  {errors.itemName && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.itemName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Item Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={showCustomType ? "custom" : formData.type || ""}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger
                      className={`border-2 ${errors.type ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                    >
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          <span>Other (Custom Type)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.type}
                    </div>
                  )}
                </div>

                {showCustomType && (
                  <div className="space-y-2">
                    <Label htmlFor="customType" className="text-sm font-medium">
                      Custom Type <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customType"
                      value={customType}
                      onChange={(e) =>
                        handleInputChange("customType", e.target.value)
                      }
                      placeholder="e.g., Network Switch, UPS, etc."
                      className={`border-2 ${errors.customType ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                    />

                    {errors.customType && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {errors.customType}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium">
                    Model
                  </Label>
                  <Input
                    id="model"
                    value={formData.model || ""}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="e.g., Latitude 5420, ThinkPad X1, etc."
                    className="border-2 border-primary/30 focus:border-primary focus-visible:outline-none"
                  />

                  <p className="text-xs text-muted-foreground">
                    Specify the model number or name (optional)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="purchasedDate"
                    className="text-sm font-medium"
                  >
                    Purchase Date <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="purchasedDate"
                      type="date"
                      value={formData.purchasedDate || ""}
                      onChange={(e) =>
                        handleInputChange("purchasedDate", e.target.value)
                      }
                      className={`border-2 pl-10 ${errors.purchasedDate ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                    />
                  </div>
                  {errors.purchasedDate && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.purchasedDate}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignmentType" className="text-sm font-medium">
                  Assignment Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.assignmentType || ""}
                  onValueChange={(value) =>
                    handleInputChange("assignmentType", value)
                  }
                >
                  <SelectTrigger
                    className={`border-2 ${errors.assignmentType ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                  >
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location/Place</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="staff">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Staff Member</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.assignmentType && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.assignmentType}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Choose whether this item is assigned to a specific staff
                  member or a location
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  {formData.assignmentType === "staff"
                    ? "Staff Name"
                    : "Location"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Popover
                  open={locationComboOpen}
                  onOpenChange={setLocationComboOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={locationComboOpen}
                      className={`w-full justify-between border-2 ${errors.location ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                    >
                      {formData.location ||
                        (formData.assignmentType === "staff"
                          ? "Select or enter staff name..."
                          : "Select or enter location...")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder={
                          formData.assignmentType === "staff"
                            ? "Search or type new staff name..."
                            : "Search or type new location..."
                        }
                        value={formData.location || ""}
                        onValueChange={(value) =>
                          handleInputChange("location", value)
                        }
                      />

                      <CommandEmpty>
                        <CommandItem
                          onSelect={() => {
                            // Keep the current typed value and close the dropdown
                            setLocationComboOpen(false);
                          }}
                          className="flex items-center gap-2 text-primary cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          <span>
                            Add new{" "}
                            {formData.assignmentType === "staff"
                              ? "staff member"
                              : "location"}
                            : "{formData.location}"
                          </span>
                        </CommandItem>
                      </CommandEmpty>
                      <CommandGroup>
                        {(formData.assignmentType === "staff"
                          ? staffSuggestions
                          : locationSuggestions
                        ).length > 0 && (
                          <>
                            {(formData.assignmentType === "staff"
                              ? staffSuggestions
                              : locationSuggestions
                            ).map((suggestion) => (
                              <CommandItem
                                key={suggestion}
                                value={suggestion}
                                onSelect={(currentValue) => {
                                  handleInputChange("location", currentValue);
                                  setLocationComboOpen(false);
                                }}
                                className="flex items-center justify-between group"
                              >
                                <div className="flex items-center">
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formData.location === suggestion
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />

                                  {suggestion}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSuggestion(suggestion);
                                  }}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </CommandItem>
                            ))}
                            {/* Add separator and "Add New" option */}
                            {formData.location &&
                              formData.location.trim() &&
                              !(
                                formData.assignmentType === "staff"
                                  ? staffSuggestions
                                  : locationSuggestions
                              ).includes(formData.location.trim()) && (
                                <CommandItem
                                  onSelect={() => {
                                    // Keep the current typed value and close the dropdown
                                    setLocationComboOpen(false);
                                  }}
                                  className="flex items-center gap-2 text-primary border-t mt-1 pt-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span>
                                    Add new{" "}
                                    {formData.assignmentType === "staff"
                                      ? "staff member"
                                      : "location"}
                                    : "{formData.location}"
                                  </span>
                                </CommandItem>
                              )}
                          </>
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.location && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.location}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.assignmentType === "staff"
                    ? "Select from existing staff members or type a new name to add it to the list"
                    : "Select from existing locations or type a new location to add it to the list"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">
                  Department <span className="text-destructive">*</span>
                </Label>
                {(() => {
                  const userData = getUserData();
                  console.log("AddEditITItemModal - User Data:", userData); // Debug log
                  console.log("User role:", userData?.role); // Debug log
                  console.log("User department:", userData?.department); // Debug log
                  console.log("Role check:", userData?.role === "asyv-items"); // Debug log
                  console.log(
                    "Department check:",
                    userData?.department &&
                      userData.department !== "All Departments",
                  ); // Debug log
                  const isAsyvItemsWithSpecificDept =
                    userData?.role === "asyv-items" &&
                    userData.department &&
                    userData.department !== "All Departments";
                  console.log(
                    "Is ASYV Items with specific dept:",
                    isAsyvItemsWithSpecificDept,
                  ); // Debug log
                  if (isAsyvItemsWithSpecificDept) {
                    // Show read-only field for ASYV Items users with specific department
                    const userDepartment =
                      userData.department === "custom"
                        ? userData.customDepartment
                        : userData.department;
                    console.log(
                      "User department:",
                      userDepartment,
                      "Form department:",
                      formData.department,
                    ); // Debug log
                    return (
                      <div className="relative">
                        <Input
                          value={userDepartment || ""}
                          disabled
                          className="border-2 border-muted bg-muted/50 text-muted-foreground cursor-not-allowed"
                        />

                        <p className="text-xs text-muted-foreground mt-1">
                          Department is set based on your account permissions
                        </p>
                      </div>
                    );
                  }
                  // Show normal select for admins and users with "All Departments"
                  return (
                    <Select
                      value={
                        showCustomDepartment
                          ? "custom"
                          : formData.department || ""
                      }
                      onValueChange={handleDepartmentChange}
                    >
                      <SelectTrigger
                        className={`border-2 ${errors.department ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
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
                        {customDepartments
                          .filter((dept) => {
                            const deptLower = dept.toLowerCase();
                            const predefinedDepts = [
                              "it",
                              "l&p",
                              "hld",
                              "pw",
                              "school",
                              "leap",
                              "ilc",
                              "hr",
                              "finance",
                              "administration",
                            ];
                            return (
                              deptLower !== "custom" &&
                              !predefinedDepts.includes(deptLower)
                            );
                          })
                          .map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        <SelectItem value="custom">
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span>Other (Custom Department)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  );
                })()}
                {errors.department && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.department}
                  </div>
                )}
              </div>

              {showCustomDepartment && (
                <div className="space-y-2">
                  <Label
                    htmlFor="customDepartment"
                    className="text-sm font-medium"
                  >
                    Custom Department{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customDepartment"
                    value={customDepartment}
                    onChange={(e) =>
                      handleInputChange("customDepartment", e.target.value)
                    }
                    placeholder="e.g., IT Support, Maintenance, etc."
                    className={`border-2 ${errors.customDepartment ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                  />

                  {errors.customDepartment && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.customDepartment}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Network className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Technical Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber" className="text-sm font-medium">
                    Serial Number
                    <Badge variant="outline" className="ml-2 text-xs">
                      Optional
                    </Badge>
                  </Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber || ""}
                    onChange={(e) =>
                      handleInputChange("serialNumber", e.target.value)
                    }
                    placeholder="e.g., SN123456789"
                    className="border-2 border-primary/30 focus:border-primary focus-visible:outline-none font-mono"
                  />

                  <p className="text-xs text-muted-foreground">
                    Device serial number for tracking and warranty purposes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="macAddress" className="text-sm font-medium">
                    MAC Address
                    <Badge variant="outline" className="ml-2 text-xs">
                      Optional
                    </Badge>
                  </Label>
                  <div className="relative">
                    <Network className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="macAddress"
                      value={formData.macAddress || ""}
                      onChange={(e) =>
                        handleInputChange("macAddress", e.target.value)
                      }
                      placeholder="00:1B:44:11:3A:B7"
                      className={`border-2 pl-10 font-mono ${errors.macAddress ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                    />
                  </div>
                  {errors.macAddress && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.macAddress}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Format: XX:XX:XX:XX:XX:XX (for network devices)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status || ""}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger
                    className={`border-2 ${errors.status ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Working</span>
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="under maintenance">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-yellow-600" />
                        <span>Under Maintenance</span>
                        <Badge variant="secondary" className="text-xs">
                          Maintenance
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="need attention">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span>Need Attention</span>
                        <Badge
                          variant="outline"
                          className="text-xs border-orange-400 text-orange-700"
                        >
                          Issues
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="not active">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>Not Active</span>
                        <Badge variant="destructive" className="text-xs">
                          Dead
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.status}
                  </div>
                )}
              </div>

              {/* Status Description */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Status Information
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      {formData.status === "working" &&
                        "Item is fully functional and in active use."}
                      {formData.status === "under maintenance" &&
                        "Item is temporarily out of service for maintenance or repairs."}
                      {formData.status === "need attention" &&
                        "Item is being used but has issues that need attention or repair."}
                      {formData.status === "not active" &&
                        "Item is not functional, dead, or permanently out of service."}
                      {!formData.status &&
                        "Select a status to see description."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="operationStatus"
                  className="text-sm font-medium"
                >
                  Operation Status
                </Label>
                <Select
                  value={formData.operationStatus || ""}
                  onValueChange={(value) =>
                    handleInputChange("operationStatus", value)
                  }
                >
                  <SelectTrigger className="border-2 border-primary/30 focus:border-primary focus-visible:outline-none">
                    <SelectValue placeholder="Select operation status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working well">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Working Well</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="slow">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-yellow-600" />
                        <span>Slow</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span>Critical</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Indicates the operational performance of the item
                </p>
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
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Item" : "Create Item"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditITItemModal;

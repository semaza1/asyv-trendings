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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Edit,
  Wrench,
  MapPin,
  Settings,
  ArrowUp,
  User,
  RotateCcw,
  Eye,
  Sparkles,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";

const actionTypes = [
  { value: "maintenance", label: "Maintenance", icon: Wrench },
  { value: "relocation", label: "Relocation", icon: MapPin },
  { value: "repair", label: "Repair", icon: Settings },
  { value: "upgrade", label: "Upgrade", icon: ArrowUp },
  { value: "assignment", label: "Assignment", icon: User },
  { value: "return", label: "Return", icon: RotateCcw },
  { value: "inspection", label: "Inspection", icon: Eye },
  { value: "cleaning", label: "Cleaning", icon: Sparkles },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

const AddActionModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  device,
}) => {
  const isEditing = Boolean(initialData);
  const [formData, setFormData] = useState({
    actionType: "",
    description: "",
    fromLocation: "",
    toLocation: "",
    actionDate: "",
    cost: "",
    notes: "",
    status: "completed",
    performedByName: "Current User", // In real app, this would come from auth context
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          actionType: initialData.actionType,
          description: initialData.description,
          fromLocation: initialData.fromLocation || "",
          toLocation: initialData.toLocation || "",
          actionDate: initialData.actionDate.split("T")[0],
          cost: initialData.cost?.toString() || "",
          notes: initialData.notes || "",
          status: initialData.status,
          performedByName: initialData.performedByName,
        });
      } else {
        setFormData({
          actionType: "",
          description: "",
          fromLocation: device.location,
          toLocation: "",
          actionDate: new Date().toISOString().split("T")[0],
          cost: "",
          notes: "",
          status: "completed",
          performedByName: "Current User",
        });
      }
      setErrors({});
    }
  }, [open, initialData, device]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.actionType) {
      newErrors.actionType = "Action type is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.actionDate) {
      newErrors.actionDate = "Action date is required";
    }
    if (formData.actionType === "relocation" && !formData.toLocation.trim()) {
      newErrors.toLocation = "Destination location is required for relocations";
    }
    if (formData.cost && isNaN(Number(formData.cost))) {
      newErrors.cost = "Cost must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const actionData = {
        ...formData,
        cost: formData.cost ? Number(formData.cost) : undefined,
        actionDate: new Date(formData.actionDate).toISOString(),
        ...(isEditing && {
          _id: initialData._id,
          createdAt: initialData.createdAt,
        }),
      };

      await onSubmit(actionData);
    } catch (error) {
      console.error("Error submitting action:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLocationFields = ["relocation", "assignment", "return"].includes(
    formData.actionType,
  );
  const showCostField = ["maintenance", "repair", "upgrade"].includes(
    formData.actionType,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !isSubmitting && onOpenChange(open)}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              {isEditing ? (
                <Edit className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </div>
            {isEditing ? "Edit Action" : "Add New Action"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the action details"
              : `Record a new action for ${device.itemName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 bg-muted/30">
            <CardContent className="pt-6 space-y-4">
              {/* Action Type */}
              <div className="space-y-2">
                <Label htmlFor="actionType">
                  Action Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.actionType}
                  onValueChange={(value) =>
                    handleInputChange("actionType", value)
                  }
                >
                  <SelectTrigger
                    className={errors.actionType ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.actionType && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.actionType}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the action taken..."
                  rows={3}
                  className={errors.description ? "border-destructive" : ""}
                />

                {errors.description && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </div>
                )}
              </div>

              {/* Location Fields (conditional) */}
              {showLocationFields && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromLocation">From Location</Label>
                    <Input
                      id="fromLocation"
                      value={formData.fromLocation}
                      onChange={(e) =>
                        handleInputChange("fromLocation", e.target.value)
                      }
                      placeholder="Current location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toLocation">
                      To Location{" "}
                      {formData.actionType === "relocation" && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    <Input
                      id="toLocation"
                      value={formData.toLocation}
                      onChange={(e) =>
                        handleInputChange("toLocation", e.target.value)
                      }
                      placeholder="New location"
                      className={errors.toLocation ? "border-destructive" : ""}
                    />

                    {errors.toLocation && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {errors.toLocation}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date and Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actionDate">
                    Action Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="actionDate"
                    type="date"
                    value={formData.actionDate}
                    onChange={(e) =>
                      handleInputChange("actionDate", e.target.value)
                    }
                    max={new Date().toISOString().split("T")[0]}
                    className={errors.actionDate ? "border-destructive" : ""}
                  />

                  {errors.actionDate && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors.actionDate}
                    </div>
                  )}
                </div>

                {showCostField && (
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) =>
                        handleInputChange("cost", e.target.value)
                      }
                      placeholder="0.00"
                      className={errors.cost ? "border-destructive" : ""}
                    />

                    {errors.cost && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {errors.cost}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional information..."
                  rows={2}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
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
                  {isEditing ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{isEditing ? "Update Action" : "Add Action"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddActionModal;

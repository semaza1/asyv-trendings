import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  Plus,
  Wrench,
  MapPin,
  Settings,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

// Action type configurations
const actionTypeConfig = {
  working: {
    label: "Working",
    icon: Settings,
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  "under maintenance": {
    label: "Under Maintenance",
    icon: Wrench,
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  "need attention": {
    label: "Need Attention",
    icon: Settings,
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  "not active": {
    label: "Not Active",
    icon: MoreHorizontal,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  other: {
    label: "Other",
    icon: MoreHorizontal,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
};

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";

const DeviceActionsModal = ({
  open,
  onOpenChange,
  device,
  onDeviceStatusUpdate,
  onDeviceOperationStatusUpdate,
}) => {
  const [actions, setActions] = useState([]);
  const [filteredActions, setFilteredActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addActionOpen, setAddActionOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Load actions from API when modal opens
  useEffect(() => {
    const fetchActions = async () => {
      if (open && device) {
        setLoading(true);
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(
            `${API_BASE_URL}/device-actions/${device._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          const result = await response.json();
          if (result.success) {
            // Sort by date (newest first)
            const sortedActions = result.data.sort(
              (a, b) =>
                new Date(b.actionDate).getTime() -
                new Date(a.actionDate).getTime(),
            );
            setActions(sortedActions);
            setFilteredActions(sortedActions);
          } else {
            console.error("Error fetching actions:", result.message);
            setActions([]);
            setFilteredActions([]);
          }
        } catch (error) {
          console.error("Error fetching actions:", error);
          setActions([]);
          setFilteredActions([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchActions();
  }, [open, device]);

  // Filter and search actions
  useEffect(() => {
    let filtered = actions;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((action) => action.actionType === filterType);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (action) =>
          action.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          action.performedByName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          action.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredActions(filtered);
  }, [searchQuery, filterType, actions]);

  const handleAddAction = async (newAction) => {
    const token = localStorage.getItem("authToken");
    // First, create the action
    const response = await fetch(`${API_BASE_URL}/device-actions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newAction,
        itemId: device?._id,
      }),
    });

    const result = await response.json();
    if (result.success) {
      // Always update the device operation status
      if (device && newAction.operationStatus) {
        try {
          const updateData = {
            operationStatus: newAction.operationStatus,
          };

          // Also update the device status if action type matches valid statuses
          const validStatuses = [
            "working",
            "under maintenance",
            "need attention",
            "not active",
          ];
          if (validStatuses.includes(newAction.actionType)) {
            updateData.status = newAction.actionType;
          }

          const updateResponse = await fetch(
            `${API_BASE_URL}/it-items/${device._id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updateData),
            },
          );
          const updateResult = await updateResponse.json();
          if (updateResult.success) {
            // Notify parent component about the status change (if status was updated)
            if (updateData.status && onDeviceStatusUpdate) {
              onDeviceStatusUpdate(device._id, newAction.actionType);
            }
            // Always notify parent component about the operation status change
            if (onDeviceOperationStatusUpdate) {
              onDeviceOperationStatusUpdate(
                device._id,
                newAction.operationStatus,
              );
            }
          } else {
            console.warn(
              "Failed to update device status:",
              updateResult.message,
            );
          }
        } catch (error) {
          console.warn("Error updating device status:", error);
        }
      }
      setActions([result.data, ...actions]);
      setAddActionOpen(false);
    } else {
      console.error("Error creating action:", result.message);
      throw new Error(result.message || "Failed to create action");
    }
  };

  const handleEditAction = async (updatedAction) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE_URL}/device-actions/action/${updatedAction._id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAction),
      },
    );

    const result = await response.json();
    if (result.success) {
      setActions(
        actions.map((a) => (a._id === updatedAction._id ? result.data : a)),
      );
      setEditingAction(null);
      setAddActionOpen(false);
    } else {
      console.error("Error updating action:", result.message);
      throw new Error(result.message || "Failed to update action");
    }
  };

  const handleDeleteAction = async (actionId) => {
    if (confirm("Are you sure you want to delete this action?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/device-actions/action/${actionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const result = await response.json();
        if (result.success) {
          setActions(actions.filter((a) => a._id !== actionId));
        } else {
          console.error("Error deleting action:", result.message);
          alert("Failed to delete action: " + result.message);
        }
      } catch (error) {
        console.error("Error deleting action:", error);
        alert("Failed to delete action. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (actionType) => {
    const config = actionTypeConfig[actionType] || actionTypeConfig.other;
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  };

  if (!device) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <History className="h-6 w-6 text-primary" />
                  Device Action History
                </DialogTitle>
                <DialogDescription className="mt-2">
                  <span className="font-semibold text-foreground">
                    {device.itemName}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{device.type}</span>
                  <span className="mx-2">•</span>
                  <span>{device.location}</span>
                </DialogDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingAction(null);
                  setAddActionOpen(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </div>
          </DialogHeader>

          {/* Search and Filter */}
          <div className="flex gap-3 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-2 border-primary/30 focus:border-primary focus-visible:outline-none pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px] border-2 border-primary/30 focus:border-primary focus-visible:outline-none">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="under maintenance">
                  Under Maintenance
                </SelectItem>
                <SelectItem value="need attention">Need Attention</SelectItem>
                <SelectItem value="not active">Not Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions Timeline */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : filteredActions.length === 0 ? (
              <Card className="border-0 bg-muted/30">
                <CardContent className="pt-12 pb-12 text-center">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery || filterType !== "all"
                      ? "No actions found matching your criteria"
                      : "No actions recorded yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredActions.map((action, index) => {
                const config =
                  actionTypeConfig[action.actionType] || actionTypeConfig.other;
                const Icon = config.icon;
                return (
                  <Card
                    key={action._id}
                    className="border-l-4 hover:shadow-md transition-shadow"
                    style={{
                      borderLeftColor: config.color.replace("text-", "#"),
                    }}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className={`p-3 rounded-lg ${config.bgColor}`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {config.label}
                              </Badge>
                              {action.operationStatus && (
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    action.operationStatus === "working well"
                                      ? "bg-green-100 text-green-800"
                                      : action.operationStatus === "slow"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {action.operationStatus === "working well"
                                    ? "✅ Working Well"
                                    : action.operationStatus === "slow"
                                      ? "⚠️ Slow"
                                      : "🔴 Critical"}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(action.actionDate)}
                              </span>
                            </div>

                            <p className="font-semibold text-foreground mb-1">
                              {action.description}
                            </p>

                            {(action.fromLocation || action.toLocation) && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <MapPin className="h-3 w-3" />
                                {action.fromLocation && (
                                  <span>{action.fromLocation}</span>
                                )}
                                {action.fromLocation && action.toLocation && (
                                  <span>→</span>
                                )}
                                {action.toLocation && (
                                  <span className="font-medium">
                                    {action.toLocation}
                                  </span>
                                )}
                              </div>
                            )}

                            {action.notes && (
                              <p className="text-sm text-muted-foreground italic">
                                Note: {action.notes}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>
                                Performed by:{" "}
                                <strong>{action.performedByName}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingAction(action);
                              setAddActionOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAction(action._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Action Modal - Inline Implementation */}
      <Dialog open={addActionOpen} onOpenChange={setAddActionOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {editingAction ? (
                  <Edit className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </div>
              {editingAction ? "Edit Action" : "Add New Action"}
            </DialogTitle>
            <DialogDescription>
              {editingAction
                ? "Update the action details"
                : `Record a new action for ${device?.itemName}`}
            </DialogDescription>
          </DialogHeader>

          <AddActionForm
            editingAction={editingAction}
            device={device}
            onSubmit={async (actionData) => {
              if (editingAction) {
                await handleEditAction({
                  ...actionData,
                  _id: editingAction._id,
                  createdAt: editingAction.createdAt,
                });
              } else {
                await handleAddAction(actionData);
              }
            }}
            onCancel={() => setAddActionOpen(false)}
            onDeviceOperationStatusUpdate={onDeviceOperationStatusUpdate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

const actionTypesConfig = [
  { value: "working", label: "Working", icon: Settings },
  { value: "under maintenance", label: "Under Maintenance", icon: Wrench },
  { value: "need attention", label: "Need Attention", icon: Settings },
  { value: "not active", label: "Not Active", icon: MoreHorizontal },
  { value: "other", label: "Other (Custom)", icon: MoreHorizontal },
];

const AddActionForm = ({
  editingAction,
  device,
  onSubmit,
  onCancel,
  onDeviceOperationStatusUpdate,
}) => {
  const [formData, setFormData] = useState({
    actionType: "",
    customActionType: "",
    description: "",
    fromLocation: "",
    toLocation: "",
    actionDate: "",
    cost: "",
    notes: "",
    operationStatus: "working well",
    performedByName: "Current User",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAction) {
      const isCustomType = ![
        "working",
        "under maintenance",
        "need attention",
        "not active",
      ].includes(editingAction.actionType);
      setFormData({
        actionType: isCustomType ? "other" : editingAction.actionType,
        customActionType: isCustomType ? editingAction.actionType : "",
        description: editingAction.description,
        fromLocation: editingAction.fromLocation || "",
        toLocation: editingAction.toLocation || "",
        actionDate: editingAction.actionDate.split("T")[0],
        cost: editingAction.cost?.toString() || "",
        notes: editingAction.notes || "",
        operationStatus: device?.operationStatus || "working well", // Use device's current operation status or default
        performedByName: editingAction.performedByName,
      });
    } else if (device) {
      // Set default action type to match current device status
      const defaultActionType = device.status || "working";
      // Set default operation status to match current device operation status
      const defaultOperationStatus = device.operationStatus || "working well";
      setFormData({
        actionType: defaultActionType,
        customActionType: "",
        description: "",
        fromLocation: device.location,
        toLocation: "",
        actionDate: new Date().toISOString().split("T")[0],
        cost: "",
        notes: "",
        operationStatus: defaultOperationStatus,
        performedByName: "Current User",
      });
    }
  }, [editingAction, device]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.actionType) newErrors.actionType = "Action type is required";
    if (formData.actionType === "other" && !formData.customActionType.trim()) {
      newErrors.customActionType = "Please specify the custom action type";
    }
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.actionDate) newErrors.actionDate = "Action date is required";
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
      // Create date with current time instead of midnight
      const selectedDate = new Date(formData.actionDate);
      const now = new Date();
      selectedDate.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds(),
      );
      const actionData = {
        ...formData,
        actionType:
          formData.actionType === "other"
            ? formData.customActionType
            : formData.actionType,
        cost: formData.cost ? Number(formData.cost) : undefined,
        actionDate: selectedDate.toISOString(),
        status: "completed", // Default status since we removed the status field
      };
      // Remove customActionType from the submitted data
      delete actionData.customActionType;

      await onSubmit(actionData);
    } catch (error) {
      console.error("Error submitting action:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save action. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLocationFields = ["relocation", "assignment", "return"].includes(
    formData.actionType,
  );
  const showCostField = false; // Cost field removed from all action types

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="border-0 bg-muted/30">
        <CardContent className="pt-6 space-y-4">
          {/* Action Type */}
          <div className="space-y-2">
            <Label htmlFor="actionType">
              Action Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.actionType}
              onValueChange={(value) => handleInputChange("actionType", value)}
            >
              <SelectTrigger
                className={`border-2 ${errors.actionType ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
              >
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                {actionTypesConfig.map((type) => (
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
              <p className="text-sm text-destructive">{errors.actionType}</p>
            )}
          </div>

          {/* Custom Action Type (shown when "other" is selected) */}
          {formData.actionType === "other" && (
            <div className="space-y-2">
              <Label htmlFor="customActionType">
                Custom Action Type <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customActionType"
                value={formData.customActionType}
                onChange={(e) =>
                  handleInputChange("customActionType", e.target.value)
                }
                placeholder="e.g., Installation, Configuration, Training..."
                className={`border-2 ${errors.customActionType ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
              />

              {errors.customActionType && (
                <p className="text-sm text-destructive">
                  {errors.customActionType}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the action taken..."
              rows={3}
              className={`border-2 ${errors.description ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
            />

            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Location Fields */}
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
                  className="border-2 border-primary/30 focus:border-primary focus-visible:outline-none"
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
                  className={`border-2 ${errors.toLocation ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                />

                {errors.toLocation && (
                  <p className="text-sm text-destructive">
                    {errors.toLocation}
                  </p>
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
                className={`border-2 ${errors.actionDate ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
              />

              {errors.actionDate && (
                <p className="text-sm text-destructive">{errors.actionDate}</p>
              )}
            </div>

            {showCostField && (
              <div className="space-y-2">
                <Label htmlFor="cost">Cost (FRW)</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  placeholder="0"
                  className={`border-2 ${errors.cost ? "border-destructive focus:border-destructive" : "border-primary/30 focus:border-primary"} focus-visible:outline-none`}
                />

                {errors.cost && (
                  <p className="text-sm text-destructive">{errors.cost}</p>
                )}
              </div>
            )}
          </div>

          {/* Operation Status */}
          <div className="space-y-2">
            <Label htmlFor="operationStatus">
              Operation Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.operationStatus}
              onValueChange={(value) =>
                handleInputChange("operationStatus", value)
              }
            >
              <SelectTrigger className="border-2 border-primary/30 focus:border-primary focus-visible:outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="working well">Working Well</SelectItem>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
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
              className="border-2 border-primary/30 focus:border-primary focus-visible:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              {editingAction ? "Updating..." : "Adding..."}
            </div>
          ) : (
            <>{editingAction ? "Update Action" : "Add Action"}</>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default DeviceActionsModal;

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Monitor,
  Laptop,
  Printer,
  HardDrive,
  CheckCircle,
  XCircle,
  Clock,
  Computer,
  AlertTriangle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import AddEditITItemModal from "./AddEditITItemModal";
import ReportsModal from "./ReportsModal";
import AllDeviceActionsModal from "./AllDeviceActionsModal";
import DeviceActionsModal from "./DeviceActionsModal";
import ITItemsImportDialog from "./ITItemsImportDialog";
import ITItemsHeader from "./ITItemsHeader";
import ITItemsStats from "./ITItemsStats";
import ITItemsFiltersBar from "./ITItemsFiltersBar";
import ITItemsStatusSection from "./ITItemsStatusSection";
import { useToast } from "@/hooks/use-toast";
import { logout, getUserData } from "@/utils/auth";
// import xlsx for parsing Excel and CSV files

const ALLOWED_COLUMNS = [
  "itemName",
  "type",
  "customType",
  "model",
  "purchasedDate",
  "serialNumber",
  "macAddress",
  "status",
  "operationStatus",
  "assignmentType",
  "location",
  "department",
];

// API base URL - update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";

const ITItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletingItem, setDeletingItem] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [deviceActionsModalOpen, setDeviceActionsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [activeStatusTab, setActiveStatusTab] = useState("working");
  const [typeOptions, setTypeOptions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  // State for import dialog/modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Helper function to handle authentication errors
  const handleAuthError = () => {
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please log in again.",
      variant: "destructive",
    });
    logout(); // This will redirect to home page
  };

  // Helper function to format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Returns yyyy-MM-dd format
  };

  // API Functions
  const fetchITItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const userData = getUserData();
      // Check if token exists
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Build query parameters for department filtering
      let url = `${API_BASE_URL}/it-items`;
      const queryParams = new URLSearchParams();

      // If user is ASYV Items and has a specific department, filter by department
      if (
        userData?.role === "asyv-items" &&
        userData.department &&
        userData.department !== "All Departments"
      ) {
        const department =
          userData.department === "custom"
            ? userData.customDepartment
            : userData.department;
        if (department) {
          queryParams.append("department", department);
        }
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return; // Don't throw error, just handle logout
        }
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        throw new Error(
          errorData.message || `Server error: ${response.status}`,
        );
      }

      const data = await response.json();
      setItems(data.data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load IT items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch items and types on component mount
  useEffect(() => {
    fetchITItems();
    fetchTypeOptions();
  }, []);

  // Function to fetch all types (standard + custom) from the backend
  const fetchTypeOptions = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const response = await fetch(`${API_BASE_URL}/it-items/types`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        throw new Error("Failed to fetch types");
      }

      const data = await response.json();
      // Build complete type options array
      const standardTypeOptions = [
        { value: "laptop", label: "Laptop", icon: Laptop },
        { value: "desktop", label: "Desktop", icon: Computer },
        { value: "printer", label: "Printer", icon: Printer },
        { value: "monitor", label: "Monitor", icon: Monitor },
        {
          value: "photocopy machine",
          label: "Photocopy Machine",
          icon: HardDrive,
        },
        { value: "projector", label: "Projector", icon: Monitor },
        { value: "tablet", label: "Tablet", icon: Laptop },
        {
          value: "network equipment",
          label: "Network Equipment",
          icon: HardDrive,
        },
      ];
      // Add custom types from the database
      const customTypeOptions = data.data.customTypes.map((customType) => ({
        value: customType.value,
        label: customType.label,
        icon: HardDrive, // Default icon for custom types
        isCustom: true,
      }));
      // Always include the "Custom" option at the end
      const allTypeOptions = [
        ...standardTypeOptions,
        ...customTypeOptions,
        { value: "custom", label: "Custom (Add New)", icon: HardDrive },
      ];
      setTypeOptions(allTypeOptions);
    } catch (error) {
      console.error("Error fetching type options:", error);
      // Fallback to standard options if API fails
      const fallbackOptions = [
        { value: "laptop", label: "Laptop", icon: Laptop },
        { value: "desktop", label: "Desktop", icon: Computer },
        { value: "printer", label: "Printer", icon: Printer },
        { value: "monitor", label: "Monitor", icon: Monitor },
        {
          value: "photocopy machine",
          label: "Photocopy Machine",
          icon: HardDrive,
        },
        { value: "projector", label: "Projector", icon: Monitor },
        { value: "tablet", label: "Tablet", icon: Laptop },
        {
          value: "network equipment",
          label: "Network Equipment",
          icon: HardDrive,
        },
        { value: "custom", label: "Custom (Add New)", icon: HardDrive },
      ];
      setTypeOptions(fallbackOptions);
    }
  };

  // Get unique locations for filter dropdown (only physical locations, not staff names)
  const uniqueLocations = (() => {
    const locationMap = new Map();
    items
      .filter((item) => {
        // Include items where assignmentType is 'location' or undefined (for backward compatibility)
        // Exclude staff assignments
        return item.assignmentType === "location" || !item.assignmentType;
      })
      .forEach((item) => {
        const location = item.location?.trim();
        if (location && location.length > 0) {
          const lowerKey = location.toLowerCase();
          // Keep the first occurrence's capitalization, or prefer title case
          if (!locationMap.has(lowerKey)) {
            locationMap.set(lowerKey, location);
          }
        }
      });
    return Array.from(locationMap.values()).sort();
  })();

  // Filter items based on search and filters
  const baseFilteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.serialNumber &&
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.macAddress &&
        item.macAddress.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    const matchesLocation =
      filterLocation === "all" || item.location === filterLocation;
    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  // Separate items by status - sort by most recent first (createdAt descending)
  const workingItems = baseFilteredItems
    .filter((item) => item.status === "working")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const maintenanceItems = baseFilteredItems
    .filter((item) => item.status === "under maintenance")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const needAttentionItems = baseFilteredItems
    .filter((item) => item.status === "need attention")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const notActiveItems = baseFilteredItems
    .filter((item) => item.status === "not active")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  // Handle item creation/editing
  const handleItemSubmit = async (itemData) => {
    try {
      const token = localStorage.getItem("authToken");
      // Check if token exists
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You are not logged in. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      if (editingItem) {
        // Update existing item
        const response = await fetch(
          `${API_BASE_URL}/it-items/${editingItem._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(itemData),
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            handleAuthError();
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          // Handle specific error cases with user-friendly messages
          if (
            response.status === 400 &&
            errorData.message?.includes("MAC address already exists")
          ) {
            toast({
              title: "Duplicate MAC Address",
              description:
                "An item with this MAC address already exists. Please use a different MAC address or leave it empty.",
              variant: "destructive",
            });
            return; // Don't close the modal, let user fix the issue
          }
          throw new Error(errorData.message || "Failed to update IT item");
        }

        const result = await response.json();
        // Update local state
        const updatedItems = items.map((item) =>
          item._id === editingItem._id ? result.data : item,
        );
        setItems(updatedItems);
        toast({
          title: "Success",
          description: "IT item updated successfully",
        });
      } else {
        // Create new item
        const response = await fetch(`${API_BASE_URL}/it-items`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          if (response.status === 401) {
            handleAuthError();
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          // Handle specific error cases with user-friendly messages
          if (
            response.status === 400 &&
            errorData.message?.includes("MAC address already exists")
          ) {
            toast({
              title: "Duplicate MAC Address",
              description:
                "An item with this MAC address already exists. Please use a different MAC address or leave it empty.",
              variant: "destructive",
            });
            return; // Don't close the modal, let user fix the issue
          }
          throw new Error(
            errorData.message || `Failed to create IT item: ${response.status}`,
          );
        }

        const result = await response.json();
        // Add to local state
        setItems([result.data, ...items]);
        toast({
          title: "Success",
          description: "IT item created successfully",
        });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      // Refresh type options to include any new custom types
      fetchTypeOptions();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save IT item",
        variant: "destructive",
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  // Handle actual item deletion
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeletingItem(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/it-items/${itemToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        throw new Error("Failed to delete IT item");
      }

      // Remove from local state
      const updatedItems = items.filter(
        (item) => item._id !== itemToDelete._id,
      );
      setItems(updatedItems);
      toast({
        title: "Success",
        description: "IT item deleted successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete IT item",
        variant: "destructive",
      });
    } finally {
      setDeletingItem(false);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // Report generation functions
  const generateReport = (reportType, filters = {}) => {
    let filteredItems = [...items];
    // Apply status filter
    if (filters.status && filters.status !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.status === filters.status,
      );
    }
    // Apply type filter
    if (filters.type && filters.type !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.type === filters.type,
      );
    }
    // Apply location filter
    if (filters.location && filters.location !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.location === filters.location,
      );
    }
    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      filteredItems = filteredItems.filter((item) => {
        const itemDate = new Date(item.purchasedDate);
        const fromDate = filters.dateFrom
          ? new Date(filters.dateFrom)
          : new Date("1900-01-01");
        const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date();
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    return filteredItems;
  };

  const downloadReport = (reportType, filters = {}) => {
    const reportData = generateReport(reportType, filters);
    // Create CSV content
    const headers = [
      "Item Name",
      "Type",
      "Status",
      "Purchase Date",
      "Serial Number",
      "MAC Address",
      "Location/Owner",
    ];
    const csvContent = [
      headers.join(","),
      ...reportData.map((item) =>
        [
          `"${item.itemName}"`,
          `"${item.type}"`,
          `"${item.status}"`,
          `"${new Date(item.purchasedDate).toLocaleDateString()}"`,
          `"${item.serialNumber || "N/A"}"`,
          `"${item.macAddress || "N/A"}"`,
          `"${item.location}"`,
        ].join(","),
      ),
    ].join("\n");
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    // Generate filename based on filters
    let filename = "it-items-report";
    if (filters.status && filters.status !== "all") {
      filename += `-${filters.status.replace(" ", "-")}`;
    }
    if (filters.type && filters.type !== "all") {
      filename += `-${filters.type}`;
    }
    if (filters.dateFrom || filters.dateTo) {
      filename += "-date-filtered";
    }
    filename += ".csv";
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Report Downloaded",
      description: `${reportData.length} items exported to ${filename}`,
    });
  };

  // Helper to get an icon for a type (used in delete confirmation card)
  const getTypeIcon = (type) => {
    const typeOption = typeOptions.find((option) => option.value === type);
    return typeOption ? typeOption.icon : HardDrive;
  };

  // no more renderItemsTable here; table rendering is handled by ITItemsStatusSection

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
      {/* Header */}
      <ITItemsHeader
        onOpenReports={() => setReportsModalOpen(true)}
        onAddItem={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        onOpenHistory={() => setShowHistory(true)}
      />

      {/* Stats Cards */}
      <ITItemsStats items={items} />

      {/* Sticky Filter Section: offset slightly below the admin header while table scrolls */}
      <div className="sticky top-0 z-30 bg-background backdrop-blur-md border-b border-border/50 py-4 space-y-4 shadow-sm">
        <ITItemsFiltersBar
          activeStatusTab={activeStatusTab}
          onChangeStatusTab={setActiveStatusTab}
          workingCount={workingItems.length}
          maintenanceCount={maintenanceItems.length}
          needAttentionCount={needAttentionItems.length}
          notActiveCount={notActiveItems.length}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterLocation={filterLocation}
          onFilterLocationChange={setFilterLocation}
          typeOptions={typeOptions}
          uniqueLocations={uniqueLocations}
        />
      </div>

      {/* Loading and Error States */}
      {loading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <span className="ml-3 text-muted-foreground">Loading items...</span>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <div className="text-destructive mb-2">Error loading items</div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Render table based on active status tab using ITItemsStatusSection */}
          {activeStatusTab === "working" && (
            <ITItemsStatusSection
              items={workingItems}
              title="Working Items"
              StatusIcon={CheckCircle}
              statusColor="text-green-600"
              typeOptions={typeOptions}
              onOpenDeviceModal={(item) => {
                setSelectedDevice(item);
                setDeviceActionsModalOpen(true);
              }}
              onEditItem={(item) => {
                const formattedItem = {
                  ...item,
                  purchasedDate: formatDateForInput(item.purchasedDate),
                };
                setEditingItem(formattedItem);
                setIsModalOpen(true);
              }}
              onDeleteItem={handleDeleteClick}
            />
          )}
          {activeStatusTab === "under maintenance" && (
            <ITItemsStatusSection
              items={maintenanceItems}
              title="Under Maintenance Items"
              StatusIcon={Clock}
              statusColor="text-yellow-600"
              typeOptions={typeOptions}
              onOpenDeviceModal={(item) => {
                setSelectedDevice(item);
                setDeviceActionsModalOpen(true);
              }}
              onEditItem={(item) => {
                const formattedItem = {
                  ...item,
                  purchasedDate: formatDateForInput(item.purchasedDate),
                };
                setEditingItem(formattedItem);
                setIsModalOpen(true);
              }}
              onDeleteItem={handleDeleteClick}
            />
          )}
          {activeStatusTab === "need attention" && (
            <ITItemsStatusSection
              items={needAttentionItems}
              title="Need Attention Items"
              StatusIcon={AlertCircle}
              statusColor="text-orange-600"
              typeOptions={typeOptions}
              onOpenDeviceModal={(item) => {
                setSelectedDevice(item);
                setDeviceActionsModalOpen(true);
              }}
              onEditItem={(item) => {
                const formattedItem = {
                  ...item,
                  purchasedDate: formatDateForInput(item.purchasedDate),
                };
                setEditingItem(formattedItem);
                setIsModalOpen(true);
              }}
              onDeleteItem={handleDeleteClick}
            />
          )}
          {activeStatusTab === "not active" && (
            <ITItemsStatusSection
              items={notActiveItems}
              title="Not Active Items"
              StatusIcon={XCircle}
              statusColor="text-red-600"
              typeOptions={typeOptions}
              onOpenDeviceModal={(item) => {
                setSelectedDevice(item);
                setDeviceActionsModalOpen(true);
              }}
              onEditItem={(item) => {
                const formattedItem = {
                  ...item,
                  purchasedDate: formatDateForInput(item.purchasedDate),
                };
                setEditingItem(formattedItem);
                setIsModalOpen(true);
              }}
              onDeleteItem={handleDeleteClick}
            />
          )}
        </>
      )}

      {/* Show message if no items found after filtering */}
      {!loading && !error && baseFilteredItems.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No IT items found matching your criteria
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit IT Item Modal */}
      <AddEditITItemModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleItemSubmit}
        initialData={editingItem}
        typeOptions={typeOptions}
        onImportClick={() => {
          setIsImportModalOpen(true);
        }}
      />

      {/* Reports Modal */}
      <ReportsModal
        open={reportsModalOpen}
        onOpenChange={setReportsModalOpen}
        onDownload={downloadReport}
        typeOptions={typeOptions}
        items={items}
        locationOptions={uniqueLocations}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Delete IT Item
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Are you sure you want to delete this IT item? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {itemToDelete && (
            <div className="my-4 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20">
                  {React.createElement(getTypeIcon(itemToDelete.type), {
                    className: "h-5 w-5 text-red-600",
                  })}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {itemToDelete.itemName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="capitalize">{itemToDelete.type}</span>
                    <span>•</span>
                    <span>{itemToDelete.location}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deletingItem}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingItem}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {deletingItem ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <ITItemsImportDialog
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onItemsImported={(newItems) => {
          setItems((prev) => [...newItems, ...prev]);
        }}
      />

      {/* All Device Actions History Modal */}
      <AllDeviceActionsModal open={showHistory} onOpenChange={setShowHistory} />

      {/* Single Device Actions History Modal */}
      <DeviceActionsModal
        open={deviceActionsModalOpen}
        onOpenChange={setDeviceActionsModalOpen}
        device={selectedDevice}
        onDeviceStatusUpdate={(deviceId, newStatus) => {
          // Update the device status in the items array
          setItems((prevItems) =>
            prevItems.map((item) =>
              item._id === deviceId ? { ...item, status: newStatus } : item,
            ),
          );
          // Also update the selected device if it matches
          if (selectedDevice && selectedDevice._id === deviceId) {
            setSelectedDevice({ ...selectedDevice, status: newStatus });
          }
        }}
        onDeviceOperationStatusUpdate={(deviceId, newOperationStatus) => {
          // Update the device operation status in the items array
          setItems((prevItems) =>
            prevItems.map((item) =>
              item._id === deviceId
                ? { ...item, operationStatus: newOperationStatus }
                : item,
            ),
          );
          // Also update the selected device if it matches
          if (selectedDevice && selectedDevice._id === deviceId) {
            setSelectedDevice({
              ...selectedDevice,
              operationStatus: newOperationStatus,
            });
          }
        }}
      />
    </div>
  );
};

export default ITItemsPage;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Wrench,
  MapPin,
  Settings,
  ArrowUp,
  User,
  MoreHorizontal,
  Calendar,
  Search,
  Filter,
  Monitor,
} from "lucide-react";

// Action type configurations
const actionTypeConfig = {
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  relocation: {
    label: "Relocation",
    icon: MapPin,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  repair: {
    label: "Repair",
    icon: Settings,
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  upgrade: {
    label: "Upgrade",
    icon: ArrowUp,
    color: "text-green-700",
    bgColor: "bg-green-100",
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

const AllDeviceActionsModal = ({ open, onOpenChange }) => {
  const [actions, setActions] = useState([]);
  const [filteredActions, setFilteredActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Load all actions when modal opens
  useEffect(() => {
    const fetchAllActions = async () => {
      if (open) {
        setLoading(true);
        try {
          const token = localStorage.getItem("authToken");
          // Fetch all IT items first
          const itemsResponse = await fetch(`${API_BASE_URL}/it-items`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const itemsResult = await itemsResponse.json();
          if (itemsResult.success) {
            // Fetch actions for all items
            const allActionsPromises = itemsResult.data.map((item) =>
              fetch(`${API_BASE_URL}/device-actions/${item._id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }).then((res) => res.json()),
            );

            const allActionsResults = await Promise.all(allActionsPromises);
            // Combine all actions and add item info
            const combinedActions = [];
            allActionsResults.forEach((result, index) => {
              if (result.success && result.data.length > 0) {
                result.data.forEach((action) => {
                  combinedActions.push({
                    ...action,
                    itemId: {
                      _id: itemsResult.data[index]._id,
                      itemName: itemsResult.data[index].itemName,
                      type: itemsResult.data[index].type,
                    },
                  });
                });
              }
            });

            // Sort by date (newest first)
            combinedActions.sort(
              (a, b) =>
                new Date(b.actionDate).getTime() -
                new Date(a.actionDate).getTime(),
            );

            setActions(combinedActions);
            setFilteredActions(combinedActions);
          }
        } catch (error) {
          console.error("Error fetching all actions:", error);
          setActions([]);
          setFilteredActions([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAllActions();
  }, [open]);

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
          action.itemId.itemName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          action.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredActions(filtered);
  }, [searchQuery, filterType, actions]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            All Device Actions History
          </DialogTitle>
          <DialogDescription>
            Complete history of all actions performed on all devices
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="flex gap-3 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search actions or devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="relocation">Relocation</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="upgrade">Upgrade</SelectItem>
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
            filteredActions.map((action) => {
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
                          {/* Device Info */}
                          <div className="flex items-center gap-2 mb-2">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-foreground">
                              {action.itemId.itemName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {action.itemId.type}
                            </Badge>
                          </div>

                          {/* Action Info */}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(action.actionDate)}
                            </span>
                          </div>

                          <p className="font-medium text-foreground mb-1">
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
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllDeviceActionsModal;

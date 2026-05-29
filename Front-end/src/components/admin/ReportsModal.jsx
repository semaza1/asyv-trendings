import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  MapPin,
} from "lucide-react";

const ReportsModal = ({
  open,
  onOpenChange,
  onDownload,
  typeOptions,
  items,
  locationOptions,
}) => {
  const [reportFilters, setReportFilters] = useState({
    status: "all",
    type: "all",
    location: "all",
    dateFrom: "",
    dateTo: "",
  });

  const handleFilterChange = (key, value) => {
    setReportFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDownload = () => {
    onDownload("filtered", reportFilters);
    onOpenChange(false);
  };

  const handleQuickReport = (type) => {
    onDownload("status", { status: type });
    onOpenChange(false);
  };

  // Calculate preview counts
  const getPreviewCount = () => {
    let filtered = [...items];
    if (reportFilters.status !== "all") {
      filtered = filtered.filter(
        (item) => item.status === reportFilters.status,
      );
    }
    if (reportFilters.type !== "all") {
      filtered = filtered.filter((item) => item.type === reportFilters.type);
    }
    if (reportFilters.location !== "all") {
      filtered = filtered.filter(
        (item) => item.location === reportFilters.location,
      );
    }
    if (reportFilters.dateFrom || reportFilters.dateTo) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.purchasedDate);
        const fromDate = reportFilters.dateFrom
          ? new Date(reportFilters.dateFrom)
          : new Date("1900-01-01");
        const toDate = reportFilters.dateTo
          ? new Date(reportFilters.dateTo)
          : new Date();
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    return filtered.length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
            <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-center">
            Generate IT Items Report
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Download comprehensive reports of your IT inventory with various
            filtering options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Reports */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Quick Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleQuickReport("working")}
                className="h-auto p-4 flex flex-col items-center gap-2 border-2 hover:bg-green-100 hover:border-green-300 hover:shadow-md transition-all duration-300"
              >
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <div className="font-medium">Working Items</div>
                  <div className="text-sm text-muted-foreground">
                    {items.filter((item) => item.status === "working").length}{" "}
                    items
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleQuickReport("not working")}
                className="h-auto p-4 flex flex-col items-center gap-2 border-2 hover:bg-red-100 hover:border-red-300 hover:shadow-md transition-all duration-300"
              >
                <XCircle className="h-6 w-6 text-red-600" />
                <div className="text-center">
                  <div className="font-medium">Not Working</div>
                  <div className="text-sm text-muted-foreground">
                    {
                      items.filter((item) => item.status === "not working")
                        .length
                    }{" "}
                    items
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleQuickReport("under maintenance")}
                className="h-auto p-4 flex flex-col items-center gap-2 border-2 hover:bg-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all duration-300"
              >
                <Clock className="h-6 w-6 text-yellow-600" />
                <div className="text-center">
                  <div className="font-medium">Under Maintenance</div>
                  <div className="text-sm text-muted-foreground">
                    {
                      items.filter(
                        (item) => item.status === "under maintenance",
                      ).length
                    }{" "}
                    items
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Custom Filters */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Custom Filtered Report
            </h3>

            <Card className="border-2 border-dashed border-muted-foreground/20">
              <CardHeader>
                <CardTitle className="text-base">Filter Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={reportFilters.status}
                      onValueChange={(value) =>
                        handleFilterChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="not working">Not Working</SelectItem>
                        <SelectItem value="under maintenance">
                          Under Maintenance
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="type-filter">Type</Label>
                    <Select
                      value={reportFilters.type}
                      onValueChange={(value) =>
                        handleFilterChange("type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {typeOptions
                          .filter((option) => option.value !== "custom")
                          .map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="location-filter">Location/Owner</Label>
                    <Select
                      value={reportFilters.location}
                      onValueChange={(value) =>
                        handleFilterChange("location", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {locationOptions.map((location) => (
                          <SelectItem key={location} value={location}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span
                                className="truncate max-w-32"
                                title={location}
                              >
                                {location}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Purchase Date Range
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="date-from"
                        className="text-xs text-muted-foreground"
                      >
                        From Date
                      </Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={reportFilters.dateFrom}
                        onChange={(e) =>
                          handleFilterChange("dateFrom", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="date-to"
                        className="text-xs text-muted-foreground"
                      >
                        To Date
                      </Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={reportFilters.dateTo}
                        onChange={(e) =>
                          handleFilterChange("dateTo", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Items matching filters:
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {getPreviewCount()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={getPreviewCount() === 0}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report ({getPreviewCount()} items)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportsModal;

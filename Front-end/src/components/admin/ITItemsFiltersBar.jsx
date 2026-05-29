import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  Search,
  XCircle,
} from "lucide-react";

const ITItemsFiltersBar = ({
  activeStatusTab,
  onChangeStatusTab,
  workingCount,
  maintenanceCount,
  needAttentionCount,
  notActiveCount,
  searchTerm,
  onSearchTermChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  filterLocation,
  onFilterLocationChange,
  typeOptions,
  uniqueLocations,
}) => {
  return (
    <>
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={() => onChangeStatusTab("working")}
          variant={activeStatusTab === "working" ? "default" : "outline"}
          className={`${
            activeStatusTab === "working"
              ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
              : "border-2 border-green-400 text-green-700 bg-white hover:bg-green-100 hover:border-green-500 hover:text-green-800 shadow-sm hover:shadow-md"
          } transition-all duration-200`}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Working ({workingCount})
        </Button>

        <Button
          onClick={() => onChangeStatusTab("under maintenance")}
          variant={
            activeStatusTab === "under maintenance" ? "default" : "outline"
          }
          className={`${
            activeStatusTab === "under maintenance"
              ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow-md"
              : "border-2 border-yellow-400 text-yellow-700 bg-white hover:bg-yellow-100 hover:border-yellow-500 hover:text-yellow-800 shadow-sm hover:shadow-md"
          } transition-all duration-200`}
        >
          <Clock className="h-4 w-4 mr-2" />
          Under Maintenance ({maintenanceCount})
        </Button>

        <Button
          onClick={() => onChangeStatusTab("need attention")}
          variant={activeStatusTab === "need attention" ? "default" : "outline"}
          className={`${
            activeStatusTab === "need attention"
              ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md"
              : "border-2 border-orange-400 text-orange-700 bg-white hover:bg-orange-100 hover:border-orange-500 hover:text-orange-800 shadow-sm hover:shadow-md"
          } transition-all duration-200`}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Need Attention ({needAttentionCount})
        </Button>

        <Button
          onClick={() => onChangeStatusTab("not active")}
          variant={activeStatusTab === "not active" ? "default" : "outline"}
          className={`${
            activeStatusTab === "not active"
              ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
              : "border-2 border-red-400 text-red-700 bg-white hover:bg-red-100 hover:border-red-500 hover:text-red-800 shadow-sm hover:shadow-md"
          } transition-all duration-200`}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Not Active ({notActiveCount})
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, type, model, location, serial number, or MAC address..."
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger className="w-full md:w-48 border-0 bg-muted/50">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions
                  .filter((type) => type.value !== "custom")
                  .map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.label}</span>
                        {type.isCustom && (
                          <span className="text-xs text-muted-foreground">
                            (Custom)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-full md:w-48 border-0 bg-muted/50">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="under maintenance">
                  Under Maintenance
                </SelectItem>
                <SelectItem value="need attention">Need Attention</SelectItem>
                <SelectItem value="not active">Not Active</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterLocation}
              onValueChange={onFilterLocationChange}
            >
              <SelectTrigger className="w-full md:w-48 border-0 bg-muted/50">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate max-w-40" title={location}>
                        {location}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ITItemsFiltersBar;

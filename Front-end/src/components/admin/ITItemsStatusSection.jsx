import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  HardDrive,
  History,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";

const getStatusBadge = (status) => {
  switch (status) {
    case "working":
      return { variant: "default", icon: CheckCircle };
    case "under maintenance":
      return { variant: "secondary", icon: Clock };
    case "need attention":
      return { variant: "outline", icon: AlertCircle };
    case "not active":
      return { variant: "destructive", icon: XCircle };
    default:
      return { variant: "outline", icon: CheckCircle };
  }
};

const getTypeIcon = (type, typeOptions) => {
  const typeOption = typeOptions.find((option) => option.value === type);
  return typeOption ? typeOption.icon : HardDrive;
};

const getTypeBadgeColor = (type) => {
  const colors = {
    laptop: "bg-blue-100 text-blue-800 border-blue-200",
    desktop: "bg-purple-100 text-purple-800 border-purple-200",
    printer: "bg-green-100 text-green-800 border-green-200",
    monitor: "bg-orange-100 text-orange-800 border-orange-200",
    "photocopy machine": "bg-pink-100 text-pink-800 border-pink-200",
    projector: "bg-cyan-100 text-cyan-800 border-cyan-200",
    tablet: "bg-teal-100 text-teal-800 border-teal-200",
    "network equipment": "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
};

const ITItemsStatusSection = ({
  items,
  title,
  StatusIcon,
  statusColor,
  typeOptions,
  onOpenDeviceModal,
  onEditItem,
  onDeleteItem,
}) => {
  if (items.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${statusColor}`} />
            {title} (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <StatusIcon
              className={`h-12 w-12 ${statusColor} mx-auto mb-4 opacity-50`}
            />

            <p className="text-muted-foreground">
              No {title.toLowerCase()} items found
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${statusColor}`} />
          {title} ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3">
          {items.map((item) => {
            const statusBadge = getStatusBadge(item.status);
            const TypeIcon = getTypeIcon(item.type, typeOptions);

            return (
              <div
                key={item._id}
                className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onOpenDeviceModal(item)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-medium text-sm truncate"
                        title={item.itemName}
                      >
                        {item.itemName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.model || "No model"}
                      </div>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            onOpenDeviceModal(item);
                          }}
                        >
                          <History className="h-4 w-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            onEditItem(item);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteItem(item)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Badge
                    className={`${getTypeBadgeColor(
                      item.type,
                    )} text-[10px] px-1.5 py-0.5`}
                  >
                    {item.type}
                  </Badge>
                  <Badge
                    variant={statusBadge.variant}
                    className="text-[10px] px-1.5 py-0.5"
                  >
                    <statusBadge.icon className="h-2.5 w-2.5 mr-1" />
                    {item.status === "working"
                      ? "Working"
                      : item.status === "under maintenance"
                        ? "Maintenance"
                        : item.status === "need attention"
                          ? "Attention"
                          : "Not Active"}
                  </Badge>
                  {item.operationStatus && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0.5 ${
                        item.operationStatus === "working well"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : item.operationStatus === "slow"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                            : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      {item.operationStatus === "working well"
                        ? "✓"
                        : item.operationStatus === "slow"
                          ? "🐌"
                          : "⚠️"}
                    </Badge>
                  )}
                  <Badge
                    className={`${
                      item.assignmentType === "staff"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-slate-100 text-slate-800"
                    } text-[10px] px-1.5 py-0.5`}
                  >
                    {item.assignmentType === "staff" ? "👤" : "📍"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <div className="font-medium truncate" title={item.location}>
                      {item.location || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <div
                      className="font-medium truncate capitalize"
                      title={item.department}
                    >
                      {item.department || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Serial:</span>
                    <div
                      className="font-mono text-[10px] truncate"
                      title={item.serialNumber}
                    >
                      {item.serialNumber || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Purchased:</span>
                    <div className="font-medium">
                      {new Date(item.purchasedDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "2-digit",
                        },
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block rounded-lg border overflow-hidden">
          <Table className="table-fixed w-full">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[13%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
              <col className="w-[9%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold py-2 px-3">
                  Item Details
                </TableHead>
                <TableHead className="font-semibold py-2 px-2">Model</TableHead>
                <TableHead className="font-semibold py-2 px-2">
                  Department
                </TableHead>
                <TableHead className="font-semibold py-2 px-2">
                  Location/Owner
                </TableHead>
                <TableHead className="font-semibold py-2 px-2 whitespace-nowrap">
                  Serial Number
                </TableHead>
                <TableHead className="font-semibold py-2 px-2 whitespace-nowrap">
                  MAC Address
                </TableHead>
                <TableHead className="font-semibold py-2 px-2">
                  Status
                </TableHead>
                <TableHead className="font-semibold py-2 px-2">
                  Purchased
                </TableHead>
                <TableHead className="text-right font-semibold py-2 px-2">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const statusBadge = getStatusBadge(item.status);
                const TypeIcon = getTypeIcon(item.type, typeOptions);

                return (
                  <TableRow
                    key={item._id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onOpenDeviceModal(item)}
                  >
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                          <TypeIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-medium text-foreground text-sm truncate"
                            title={item.itemName}
                          >
                            {item.itemName}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Badge
                              className={`${getTypeBadgeColor(
                                item.type,
                              )} text-[10px] px-1 py-0 h-3.5`}
                            >
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-2">
                      <span
                        className="text-xs truncate block"
                        title={item.model || "N/A"}
                      >
                        {item.model || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-2">
                      <span
                        className="text-xs capitalize truncate block"
                        title={item.department}
                      >
                        {item.department || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-2">
                      <div className="min-w-0">
                        <div
                          className="text-xs truncate font-medium"
                          title={item.location}
                        >
                          {item.location || "N/A"}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Badge
                            className={`${
                              item.assignmentType === "staff"
                                ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                : "bg-slate-100 text-slate-800 border-slate-200"
                            } text-[10px] px-1 py-0 h-3.5`}
                          >
                            {item.assignmentType === "staff"
                              ? "👤 Staff"
                              : item.assignmentType === "location"
                                ? "📍 Location"
                                : "📍 Location"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-2">
                      <span
                        className="font-mono text-xs truncate block"
                        title={item.serialNumber}
                      >
                        {item.serialNumber || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-2">
                      <span
                        className="font-mono text-xs truncate block"
                        title={item.macAddress}
                      >
                        {item.macAddress || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-2">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={statusBadge.variant}
                          className="text-[10px] whitespace-nowrap px-1.5 py-0.5"
                        >
                          <statusBadge.icon className="h-2.5 w-2.5 mr-1" />
                          {item.status === "working"
                            ? "Working"
                            : item.status === "under maintenance"
                              ? "Maintenance"
                              : item.status === "need attention"
                                ? "Need Attention"
                                : "Not Active"}
                        </Badge>
                        {item.operationStatus && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-3.5 ${
                              item.operationStatus === "working well"
                                ? "bg-green-50 text-green-700 border-green-300"
                                : item.operationStatus === "slow"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                  : "bg-red-50 text-red-700 border-red-300"
                            }`}
                          >
                            {item.operationStatus === "working well"
                              ? "✓ Well"
                              : item.operationStatus === "slow"
                                ? "🐌 Slow"
                                : "⚠️ Critical"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-2 px-2">
                      {new Date(item.purchasedDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        },
                      )}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              onOpenDeviceModal(item);
                            }}
                          >
                            <History className="h-4 w-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              onEditItem(item);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteItem(item)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ITItemsStatusSection;

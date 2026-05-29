import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, History, Monitor, Plus } from "lucide-react";

const ITItemsHeader = ({ onOpenReports, onAddItem, onOpenHistory }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Monitor className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          ASYV Items Management
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Manage and track all IT equipment and devices
        </p>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button
          onClick={onOpenReports}
          variant="outline"
          className="border-2 border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-800 shadow-md hover:shadow-lg transition-all duration-300 flex-1 sm:flex-none"
        >
          <FileText className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Reports</span>
          <span className="sm:hidden">Reports</span>
        </Button>
        <Button
          onClick={onAddItem}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add ASYV Item</span>
          <span className="sm:hidden">Add Item</span>
        </Button>
        <Button
          onClick={onOpenHistory}
          variant="outline"
          className="border-2 border-blue-300 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 shadow-md hover:shadow-lg transition-all duration-300 flex-1 sm:flex-none"
        >
          <History className="h-4 w-4 mr-2" />
          Device History
        </Button>
      </div>
    </div>
  );
};

export default ITItemsHeader;

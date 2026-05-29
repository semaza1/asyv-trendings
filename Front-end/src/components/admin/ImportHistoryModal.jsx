import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, FileText, Settings } from "lucide-react";

const ImportHistoryModal = ({ open, onOpenChange, history }) => {
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Import History
          </DialogTitle>
          <DialogDescription>
            View your recent IT items import history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {history.length === 0 ? (
            <Card className="border-0 bg-muted/30">
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No import history yet</p>
              </CardContent>
            </Card>
          ) : (
            history.map((entry, index) => (
              <Card
                key={index}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {entry.fileName}
                        </span>
                        {entry.autoTransform && (
                          <Badge variant="outline" className="text-xs">
                            <Settings className="h-3 w-3 mr-1" />
                            Auto-transform
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">
                            Total:
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {entry.totalRows}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600"
                          >
                            {entry.successCount} Success
                          </Badge>
                        </div>

                        {entry.errorCount > 0 && (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <Badge variant="destructive" className="text-xs">
                              {entry.errorCount} Errors
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {entry.errorCount === 0 ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      ) : entry.successCount > 0 ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                          <XCircle className="h-5 w-5 text-yellow-600" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportHistoryModal;

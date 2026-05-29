import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  CheckCircle,
  Download,
  FileSpreadsheet,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

// NOTE: This component encapsulates all import logic that used to live inside ITItemsPage.
// Behaviour is intentionally preserved, only extracted into a dedicated, reusable dialog.

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

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";

const ITItemsImportDialog = ({ open, onOpenChange, onItemsImported }) => {
  const { toast } = useToast();

  const [importedRows, setImportedRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importSuccess, setImportSuccess] = useState([]);
  const [importStage, setImportStage] = useState("select");
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [workbookData, setWorkbookData] = useState(null);
  const [autoTransform, setAutoTransform] = useState(true);

  // Reset dialog state whenever it is opened
  useEffect(() => {
    if (open) {
      setImportedRows([]);
      setImportErrors([]);
      setImportSuccess([]);
      setImportStage("select");
      setImportLoading(false);
      setImportProgress(0);
      setEditingRowIndex(null);
      setEditingRowData(null);
      setAvailableSheets([]);
      setSelectedSheet("");
      setWorkbookData(null);
    }
  }, [open]);

  const transformRowData = (row) => {
    if (!autoTransform) return row;

    const transformed = { ...row };

    // Auto-format MAC address
    if (transformed.macAddress && transformed.macAddress.trim()) {
      let mac = transformed.macAddress.trim().toUpperCase();
      mac = mac.replace(/[:-]/g, "");
      if (/^[0-9A-F]{12}$/i.test(mac)) {
        mac = mac.match(/.{1,2}/g)?.join(":") || mac;
      }
      transformed.macAddress = mac;
    }

    // Normalize type to lowercase
    if (transformed.type) {
      transformed.type = transformed.type.toLowerCase().trim();
    }

    // Normalize status (keep mapping exactly as before)
    if (transformed.status) {
      const statusMap = {
        work: "working",
        works: "working",
        ok: "working",
        broken: "not working",
        damaged: "not working",
        repair: "under maintenance",
        maintenance: "under maintenance",
      };
      const normalized = transformed.status.toLowerCase().trim();
      transformed.status = statusMap[normalized] || normalized;
    }

    return transformed;
  };

  const handleFileImport = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });

      setWorkbookData(wb);
      setAvailableSheets(wb.SheetNames);

      if (wb.SheetNames.length === 1) {
        loadSheetData(wb, wb.SheetNames[0]);
      } else {
        setSelectedSheet(wb.SheetNames[0]);
        loadSheetData(wb, wb.SheetNames[0]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const loadSheetData = (wb, sheetName) => {
    const ws = wb.Sheets[sheetName];
    let data = XLSX.utils.sheet_to_json(ws, { defval: "" });

    data = data.map((row) => {
      const filtered = {};
      ALLOWED_COLUMNS.forEach((col) => {
        filtered[col] = row[col] || "";
      });
      return transformRowData(filtered);
    });

    setImportedRows(data);
    setImportErrors([]);
    setImportSuccess([]);
    setImportStage("preview");
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    if (workbookData) {
      loadSheetData(workbookData, sheetName);
    }
  };

  const validateImportedRows = (rows) => {
    return rows.map((row, i) => {
      let error = "";
      if (!row.itemName || !row.type || !row.purchasedDate || !row.location) {
        error =
          "Missing required fields: itemName, type, purchasedDate, location.";
      } else {
        const date = new Date(row.purchasedDate);
        if (isNaN(date.getTime()) || date > new Date()) {
          error = "Invalid or future purchasedDate.";
        }
        if (row.macAddress && row.macAddress.trim()) {
          const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
          if (!macRegex.test(row.macAddress.trim())) {
            error = "Invalid MAC address format.";
          }
        }
      }
      return { ...row, __importRow: i + 2, __error: error };
    });
  };

  const handleRemoveImportRow = (i) => {
    setImportedRows((prev) => prev.filter((_, idx) => idx !== i));
    if (editingRowIndex === i) {
      setEditingRowIndex(null);
      setEditingRowData(null);
    }
  };

  const handleStartEditRow = (i) => {
    setEditingRowIndex(i);
    setEditingRowData({ ...importedRows[i] });
  };

  const handleSaveEditRow = () => {
    if (editingRowIndex !== null && editingRowData) {
      const newRows = [...importedRows];
      newRows[editingRowIndex] = transformRowData(editingRowData);
      setImportedRows(newRows);
      setEditingRowIndex(null);
      setEditingRowData(null);
    }
  };

  const handleCancelEditRow = () => {
    setEditingRowIndex(null);
    setEditingRowData(null);
  };

  const handleEditRowChange = (field, value) => {
    setEditingRowData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmImport = async () => {
    setImportLoading(true);
    setImportErrors([]);
    setImportSuccess([]);
    setImportProgress(0);
    setImportStage("result");

    const token = localStorage.getItem("authToken");

    try {
      const validatedRows = validateImportedRows(importedRows);
      const validRows = validatedRows
        .filter((row) => !row.__error)
        .map((row) => {
          const filtered = {};
          ALLOWED_COLUMNS.forEach((col) => {
            filtered[col] = row[col] || "";
          });
          return filtered;
        });

      if (!validRows.length) {
        setImportErrors([{ row: "-", error: "No valid rows to import." }]);
        setImportLoading(false);
        return;
      }

      setImportProgress(10);

      const response = await fetch(`${API_BASE_URL}/it-items/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: validRows }),
      });

      setImportProgress(70);
      const result = await response.json();
      setImportProgress(90);

      if (result.success) {
        setImportSuccess(
          result.data.map((item, i) => ({
            ...item,
            __row: i + 1,
          })),
        );
        setImportErrors(result.errors || []);

        // Notify parent so it can add new items to local state
        if (Array.isArray(result.data) && result.data.length) {
          onItemsImported(result.data);
        }

        // Persist import history in localStorage (no UI yet, but keeps previous behaviour)
        const historyEntry = {
          timestamp: new Date().toISOString(),
          totalRows: validRows.length,
          successCount: result.data.length,
          errorCount: result.errors?.length ?? 0,
          fileName: selectedSheet || "imported-data",
          autoTransform,
        };
        const history = JSON.parse(
          localStorage.getItem("itItemsImportHistory") || "[]",
        );
        history.unshift(historyEntry);
        localStorage.setItem(
          "itItemsImportHistory",
          JSON.stringify(history.slice(0, 20)),
        );

        setImportProgress(100);
        toast({
          title: "Import Complete",
          description: `Imported ${result.data.length} items. ${
            result.errors?.length || 0
          } errors.`,
          variant: "default",
        });
      } else {
        setImportErrors([
          { row: "-", error: result.message || "Server error." },
        ]);
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      setImportErrors([{ row: "-", error: err.message }]);
      toast({
        title: "Import Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        itemName: "Dell Laptop - Example",
        type: "laptop",
        customType: "",
        purchasedDate: "2024-01-15",
        serialNumber: "SN123456789",
        macAddress: "00:1B:44:11:3A:B7",
        status: "working",
        assignmentType: "location",
        location: "Computer Lab 1",
        department: "school",
      },
      {
        itemName: "HP Printer - Reception",
        type: "printer",
        customType: "",
        purchasedDate: "2024-02-20",
        serialNumber: "HP987654321",
        macAddress: "",
        status: "working",
        assignmentType: "location",
        location: "Reception Desk",
        department: "operation",
      },
      {
        itemName: "Custom Equipment",
        type: "other",
        customType: "Network Switch",
        purchasedDate: "2024-03-10",
        serialNumber: "NS456789123",
        macAddress: "AA:BB:CC:DD:EE:FF",
        status: "under maintenance",
        assignmentType: "staff",
        location: "John Doe - IT Manager",
        department: "custom",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IT Items Template");

    const instructions = [
      {
        Field: "itemName",
        Required: "YES",
        Description: "Name of the IT item",
        Example: "Dell Laptop - Marketing",
      },
      {
        Field: "type",
        Required: "YES",
        Description:
          "Type: laptop, desktop, printer, monitor, tablet, projector, photocopy machine, network equipment, or other",
        Example: "laptop",
      },
      {
        Field: "customType",
        Required: "NO",
        Description:
          'Required only if type is "other". Specify custom type name',
        Example: "Network Switch",
      },
      {
        Field: "purchasedDate",
        Required: "YES",
        Description: "Purchase date in YYYY-MM-DD format",
        Example: "2024-01-15",
      },
      {
        Field: "serialNumber",
        Required: "NO",
        Description: "Serial number of the device",
        Example: "SN123456789",
      },
      {
        Field: "macAddress",
        Required: "NO",
        Description: "MAC address in XX:XX:XX:XX:XX:XX format",
        Example: "00:1B:44:11:3A:B7",
      },
      {
        Field: "status",
        Required: "YES",
        Description: "Status: working, not working, or under maintenance",
        Example: "working",
      },
      {
        Field: "assignmentType",
        Required: "YES",
        Description:
          "Assignment type: location or staff (whether item is assigned to a place or person)",
        Example: "location",
      },
      {
        Field: "location",
        Required: "YES",
        Description:
          "Location or staff name (depends on assignmentType: place name if location, person name if staff)",
        Example: "Computer Lab 1 or John Doe - IT Manager",
      },
      {
        Field: "department",
        Required: "YES",
        Description:
          "Department: operation, kitchen, school, clinic, leap, parental, finance, or custom name",
        Example: "school",
      },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions["!cols"] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 60 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    XLSX.writeFile(wb, "ASYV_Items_Import_Template.xlsx");

    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded successfully",
      variant: "default",
    });
  };

  const validatedRows = validateImportedRows(importedRows);
  const validCount = validatedRows.filter((r) => !r.__error).length;
  const invalidCount = validatedRows.filter((r) => r.__error).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import IT Items from Excel/CSV
          </DialogTitle>
          <DialogDescription>
            Upload your Excel or CSV file to bulk import IT items
          </DialogDescription>
        </DialogHeader>

        {importStage === "select" && (
          <div className="space-y-4">
            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-indigo-900">
                        Need a template?
                      </p>
                      <p className="text-sm text-indigo-700">
                        Download our Excel template with sample data and
                        instructions to get started quickly.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="shrink-0 border-indigo-300 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 hover:border-indigo-400 transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileImport}
                className="cursor-pointer"
              />

              <p className="text-xs text-muted-foreground">
                Upload a file with columns: <strong>itemName</strong>,
                <strong>type</strong>, customType,{" "}
                <strong>purchasedDate</strong>, macAddress, status,{" "}
                <strong>location</strong>, <strong>department</strong>
              </p>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="auto-transform"
                checked={autoTransform}
                onChange={(e) => setAutoTransform(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />

              <Label
                htmlFor="auto-transform"
                className="text-sm font-normal cursor-pointer"
              >
                Auto-transform data (format MAC addresses, normalize status
                values)
              </Label>
            </div>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-blue-900">
                      Auto-transformation features:
                    </p>
                    <ul className="text-blue-700 space-y-1 ml-4 list-disc">
                      <li>
                        MAC addresses: Converts formats like "001B44113AB7" to
                        "00:1B:44:11:3A:B7"
                      </li>
                      <li>
                        Status: Maps "broken", "repair" to standard values
                      </li>
                      <li>Type: Normalizes to lowercase</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {importStage === "preview" && (
          <div className="space-y-3">
            {availableSheets.length > 1 && (
              <div className="space-y-2">
                <Label>Select Sheet</Label>
                <Select value={selectedSheet} onValueChange={handleSheetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSheets.map((sheet) => (
                      <SelectItem key={sheet} value={sheet}>
                        {sheet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Total rows: <strong>{importedRows.length}</strong> | Valid:
                <strong className="text-green-600"> {validCount}</strong> |
                Invalid:
                <strong className="text-red-600"> {invalidCount}</strong>
              </div>
            </div>

            <div className="overflow-auto max-h-96 border rounded-lg">
              <table className="min-w-full text-xs">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur">
                  <tr>
                    <th className="px-2 py-2 border text-left font-semibold">
                      Row
                    </th>
                    {Object.keys(importedRows[0] || {}).map((h) => (
                      <th
                        key={h}
                        className="px-2 py-2 border text-left font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-2 py-2 border text-left font-semibold">
                      Status
                    </th>
                    <th className="px-2 py-2 border text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {validatedRows.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        row.__error ? "bg-red-50" : "hover:bg-muted/30"
                      }
                    >
                      <td className="px-2 py-1 border font-mono text-muted-foreground">
                        {i + 1}
                      </td>
                      {editingRowIndex === i
                        ? Object.keys(importedRows[0] || {}).map((h) => (
                            <td key={h} className="px-2 py-1 border">
                              <Input
                                value={editingRowData?.[h] || ""}
                                onChange={(e) =>
                                  handleEditRowChange(h, e.target.value)
                                }
                                className="h-7 text-xs"
                              />
                            </td>
                          ))
                        : Object.keys(importedRows[0] || {}).map((h) => (
                            <td key={h} className="px-2 py-1 border">
                              <span
                                className={
                                  h === "macAddress" ? "font-mono" : ""
                                }
                              >
                                {row[h]}
                              </span>
                            </td>
                          ))}
                      <td className="px-2 py-1 border">
                        {row.__error ? (
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        )}
                        {row.__error && (
                          <p className="text-xs text-destructive mt-1">
                            {row.__error}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-1 border">
                        {editingRowIndex === i ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={handleSaveEditRow}
                              className="h-7 text-xs"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEditRow}
                              className="h-7 text-xs"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEditRow(i)}
                              className="h-7 text-xs"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveImportRow(i)}
                              className="h-7 text-xs text-destructive"
                            >
                              <ArrowRight className="h-3 w-3 rotate-180" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 justify-between">
              <Button
                onClick={() => {
                  setImportStage("select");
                  setImportedRows([]);
                  setWorkbookData(null);
                }}
                variant="outline"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={
                  importedRows.length === 0 ||
                  validatedRows.every((row) => row.__error)
                }
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {importLoading ? (
                  <span className="animate-spin mr-2 inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full align-middle" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Import {validCount} Items
              </Button>
            </div>
          </div>
        )}

        {importStage === "result" && (
          <div className="space-y-4">
            <div className="text-lg font-bold flex items-center gap-2">
              {importLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Import Complete
                </>
              )}
            </div>

            {importLoading && (
              <div className="space-y-2">
                <Progress value={importProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Processing {importProgress}%...
                </p>
              </div>
            )}

            {!importLoading && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Success
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            {importSuccess.length}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Errors
                          </p>
                          <p className="text-2xl font-bold text-red-700">
                            {importErrors.length}
                          </p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {importErrors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Error Details
                    </Label>
                    <div className="overflow-auto max-h-64 border rounded-lg">
                      <table className="min-w-full text-xs">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">
                              Row
                            </th>
                            <th className="px-3 py-2 text-left font-semibold">
                              Error Message
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {importErrors.map((e, i) => (
                            <tr key={i} className="border-t hover:bg-muted/30">
                              <td className="px-3 py-2 font-mono">{e.row}</td>
                              <td className="px-3 py-2 text-destructive">
                                {e.error}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  onOpenChange(false);
                }}
                disabled={importLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ITItemsImportDialog;

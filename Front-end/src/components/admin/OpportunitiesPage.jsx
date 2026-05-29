import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Clock, Loader2 } from "lucide-react";
import { ContentCard } from "@/components/admin/ContentCard";
import { AddEditOpportunitiesModal } from "@/components/admin/AddEditOpportunitiesModal";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { uploadImageToVercelBlob } from "@/utils/vercelBlobUpload";

// Update this to match your actual server URL
const API_BASE_URL = import.meta.env.VITE_API_URL;
const OPPORTUNITIES_API_URL = `${API_BASE_URL}/api/opportunities`;

const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState(null);

  // Fetch opportunities from API
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching from:", OPPORTUNITIES_API_URL); // Debug log

      const response = await fetch(OPPORTUNITIES_API_URL);

      console.log("Response status:", response.status); // Debug log
      console.log("Response headers:", response.headers.get("content-type")); // Debug log

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.log("Non-JSON response:", text.substring(0, 200)); // Debug log
        throw new Error("Server returned non-JSON response");
      }

      const result = await response.json();

      if (result.success) {
        // Convert date strings to Date objects
        const opportunitiesWithDates = result.data.map((item) => ({
          ...item,
          id: item._id, // Map _id to id for compatibility
          deadline: new Date(item.deadline),
          publishedDate: new Date(item.publishedDate),
          publishDate: new Date(item.publishedDate), // Keep both for compatibility
          content: item.content || [],
        }));
        setOpportunities(opportunitiesWithDates);
      } else {
        setError(result.message || "Failed to fetch opportunities");
      }
    } catch (err) {
      console.error("Fetch error details:", err); // Debug log
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new opportunity
  const createOpportunity = async (data) => {
    try {
      let imageUrl = data.image;
      if (
        data.image &&
        typeof data.image !== "string" &&
        typeof File !== "undefined" &&
        data.image instanceof File
      ) {
        imageUrl = await uploadImageToVercelBlob(data.image, "opportunities");
      }
      const payload = {
        ...data,
        image: imageUrl,
        publishedDate: data.publishDate
          ? data.publishDate.toISOString()
          : new Date().toISOString(),
        content: data.content || [],
      };
      const response = await fetch(OPPORTUNITIES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        await fetchOpportunities(); // Refresh the list
        toast({
          title: "✅ Opportunity Created",
          description: "The opportunity was created successfully.",
        });
        return result.data;
      } else {
        throw new Error(result.message || "Failed to create opportunity");
      }
    } catch (err) {
      console.error("Error creating opportunity:", err);
      throw err;
    }
  };

  // Update opportunity
  const updateOpportunity = async (id, data) => {
    try {
      let imageUrl = data.image;
      if (
        data.image &&
        typeof data.image !== "string" &&
        typeof File !== "undefined" &&
        data.image instanceof File
      ) {
        imageUrl = await uploadImageToVercelBlob(data.image, "opportunities");
      }
      const payload = {
        ...data,
        image: imageUrl,
        publishedDate: data.publishDate
          ? data.publishDate.toISOString()
          : new Date().toISOString(),
        content: data.content || [],
      };
      const response = await fetch(`${OPPORTUNITIES_API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        await fetchOpportunities(); // Refresh the list
        toast({
          title: "Opportunity Updated",
          description: "The opportunity was updated successfully.",
        });
        return result.data;
      } else {
        throw new Error(result.message || "Failed to update opportunity");
      }
    } catch (err) {
      console.error("Error updating opportunity:", err);
      throw err;
    }
  };

  // Delete opportunity
  const deleteOpportunity = async (id) => {
    try {
      const response = await fetch(`${OPPORTUNITIES_API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchOpportunities(); // Refresh the list
        toast({
          title: "Opportunity Deleted",
          description: "The opportunity was deleted successfully.",
        });
      } else {
        throw new Error(result.message || "Failed to delete opportunity");
      }
    } catch (err) {
      console.error("Error deleting opportunity:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const getStatus = (deadline) => {
    if (!deadline) return "no-deadline";
    const now = new Date();
    const daysLeft = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft < 0) return "expired";
    if (daysLeft <= 7) return "urgent";
    if (daysLeft <= 30) return "soon";
    return "active";
  };

  const filteredOpportunities = opportunities.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStatus(item.deadline);
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        // Find the MongoDB _id from the item
        const item = opportunities.find((opp) => opp.id === deleteId);
        if (item) {
          await deleteOpportunity(item._id);
        }
      } catch (err) {
        setError("Failed to delete opportunity");
      } finally {
        setDeleteId(null);
      }
    }
  };

  
  const handleSubmit = async (data) => {
    try {
      setError(null);

      if (editingItem) {
        await updateOpportunity(editingItem._id, data);
      } else {
        await createOpportunity(data);
      }

      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || "Failed to save opportunity");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading opportunities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Opportunities Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage scholarships, internships, and other opportunities
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-primary text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Opportunity</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Opportunities</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="soon">Deadline Soon</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4">
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          Total: {opportunities.length}
        </Badge>
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-warning border-warning"
        >
          <Clock className="w-3 h-3 mr-1" />
          Urgent:{" "}
          {
            opportunities.filter(
              (item) => getStatus(item.deadline) === "urgent",
            ).length
          }
        </Badge>
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          
        </Badge>
      </div>

      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredOpportunities.map((item) => (
            <ContentCard
              key={item._id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
                          />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No opportunities found</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Opportunity
          </Button>
        </div>
      )}

      <AddEditOpportunitiesModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={
          editingItem
            ? {
                title: editingItem.title || "",
                category: editingItem.category || "Opportunities", // <-- Add this line
                description: editingItem.description || "",
                deadline: editingItem.deadline
                  ? new Date(editingItem.deadline)
                  : undefined,
                applicationLink: editingItem.applicationLink || "",
                image: editingItem.image || "",
                publishDate: editingItem.publishedDate
                  ? new Date(editingItem.publishedDate)
                  : new Date(),
                                tags: editingItem.tags || [],
                content: editingItem.content || [],
              }
            : undefined
        }
        uploadImage={(file) => uploadImageToVercelBlob(file, "opportunities")}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this opportunity? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OpportunitiesPage;

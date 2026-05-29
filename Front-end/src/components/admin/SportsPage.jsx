import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trophy, Loader2 } from "lucide-react";
import { ContentCard } from "@/components/admin/ContentCard";
import { AddEditSportsModal } from "@/components/admin/AddEditSportsModal";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToVercelBlob } from "@/utils/vercelBlobUpload";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SPORTS_API_URL = `${API_BASE_URL}/api/sports`;

const convertApiItemToContentItem = (apiItem) => ({
  id: apiItem._id,
  title: apiItem.title,
  description: apiItem.description,
  category: apiItem.category || "Sports",
  publishDate: new Date(apiItem.publishedDate),
    image: apiItem.image,
  tags: apiItem.tags || [],
  content: apiItem.content || [],
});

const SportsPage = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const { toast } = useToast();

  // Fetch sports from API
  const fetchSports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(SPORTS_API_URL);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        const converted = result.data.map(convertApiItemToContentItem);
        setSports(converted);
      } else {
        throw new Error(result.message || "Failed to fetch sports");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const filteredSports = sports.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const createSports = async (data) => {
    let imageUrl = data.image;
    if (
      data.image &&
      typeof data.image !== "string" &&
      typeof File !== "undefined" &&
      data.image instanceof File
    ) {
      imageUrl = await uploadImageToVercelBlob(data.image, "sports");
    }
    const payload = {
      ...data,
      image: imageUrl,
      publishedDate: data.publishDate
        ? data.publishDate.toISOString()
        : new Date().toISOString(),
      content: data.content || [],
    };
    const response = await fetch(SPORTS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to create sports article");
    await fetchSports();
    return result.data;
  };

  const updateSports = async (id, data) => {
    let imageUrl = data.image;
    if (
      data.image &&
      typeof data.image !== "string" &&
      typeof File !== "undefined" &&
      data.image instanceof File
    ) {
      imageUrl = await uploadImageToVercelBlob(data.image, "sports");
    }
    const payload = {
      ...data,
      image: imageUrl,
      publishedDate: data.publishDate
        ? data.publishDate.toISOString()
        : new Date().toISOString(),
      content: data.content || [],
    };
    const response = await fetch(`${SPORTS_API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to update sports article");
    await fetchSports();
    return result.data;
  };

  const deleteSports = async (id) => {
    const response = await fetch(`${SPORTS_API_URL}/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to delete sports article");
    await fetchSports();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteSports(deleteId);
        toast({
          title: "Deleted",
          description: "The sports article was deleted successfully.",
          variant: "destructive",
        });
      } catch (err) {
        setError("Failed to delete sports article");
      } finally {
        setDeleteId(null);
      }
    }
  };

  
  const handleSubmit = async (data) => {
    try {
      setError(null);
      if (editingItem) {
        await updateSports(editingItem.id, data);
        toast({
          title: "Sports Updated",
          description: "The sports article was updated successfully.",
        });
      } else {
        await createSports(data);
        toast({
          title: "Sports Posted",
          description: "The sports article was posted successfully.",
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save sports article",
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading sports articles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchSports} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Sports Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage sports news and highlights
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-primary text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Sports Article</span>
          <span className="sm:hidden">Add Article</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search sports content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4">
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          <Trophy className="w-3 h-3 mr-1" />
          Total: {sports.length}
        </Badge>
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          
        </Badge>
      </div>

      {filteredSports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSports.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
                          />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sports content found</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Sports Article
          </Button>
        </div>
      )}

      <AddEditSportsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={editingItem}
        uploadImage={(file) => uploadImageToVercelBlob(file, "sports")}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sports Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sports article? This action
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

export default SportsPage;

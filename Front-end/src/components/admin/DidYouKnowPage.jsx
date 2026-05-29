import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Lightbulb, Loader2 } from "lucide-react";
import { ContentCard } from "@/components/admin/ContentCard";
import { AddEditDidYouKnowModal } from "@/components/admin/AddEditDidYouKnowModal";
import { uploadImageToVercelBlob } from "@/utils/vercelBlobUpload";
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

const API_BASE_URL = import.meta.env.VITE_API_URL;
const DID_YOU_KNOW_API_URL = `${API_BASE_URL}/api/did-you-know`;

const convertApiItemToContentItem = (apiItem) => ({
  id: apiItem._id,
  title: apiItem.title,
  description: apiItem.description,
  category: apiItem.category,
  publishDate: new Date(apiItem.publishedDate),
    image: apiItem.image,
  tags: apiItem.tags || [],
  content: apiItem.content || [],
});

const DidYouKnowPage = () => {
  const [facts, setFacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch facts from API
  const fetchFacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(DID_YOU_KNOW_API_URL);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        const converted = result.data.map(convertApiItemToContentItem);
        setFacts(converted);
      } else {
        throw new Error(result.message || "Failed to fetch facts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacts();
  }, []);

  const filteredFacts = facts.filter(
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

  const createFact = async (data) => {
    let imageUrl = data.image;
    if (
      data.image &&
      typeof data.image !== "string" &&
      typeof File !== "undefined" &&
      data.image instanceof File
    ) {
      imageUrl = await uploadImageToVercelBlob(data.image, "did-you-know");
    }
    const payload = {
      ...data,
      image: imageUrl,
      content: data.content || [],
      publishedDate: data.publishDate
        ? data.publishDate.toISOString()
        : new Date().toISOString(),
    };
    const response = await fetch(DID_YOU_KNOW_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to create fact");
    await fetchFacts();
    return result.data;
  };

  const updateFact = async (id, data) => {
    let imageUrl = data.image;
    if (
      data.image &&
      typeof data.image !== "string" &&
      typeof File !== "undefined" &&
      data.image instanceof File
    ) {
      imageUrl = await uploadImageToVercelBlob(data.image, "did-you-know");
    }
    const payload = {
      ...data,
      image: imageUrl,
      content: data.content || [],
      publishedDate: data.publishDate
        ? data.publishDate.toISOString()
        : new Date().toISOString(),
    };
    const response = await fetch(`${DID_YOU_KNOW_API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to update fact");
    await fetchFacts();
    return result.data;
  };

  const deleteFact = async (id) => {
    const response = await fetch(`${DID_YOU_KNOW_API_URL}/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to delete fact");
    await fetchFacts();
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFact(deleteId);
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete fact");
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  
  const handleSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateFact(editingItem.id, data);
      } else {
        await createFact(data);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save fact");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading facts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchFacts} variant="outline">
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
            "Did You Know?" Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage fun facts and trivia about ASYV
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-primary text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Fun Fact</span>
          <span className="sm:hidden">Add Fact</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search facts..."
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
          <Lightbulb className="w-3 h-3 mr-1" />
          Total: {facts.length}
        </Badge>
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          
        </Badge>
      </div>

      {filteredFacts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredFacts.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={() => handleDelete(item.id)}
                          />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No facts found</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Fun Fact
          </Button>
        </div>
      )}

      <AddEditDidYouKnowModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={editingItem}
        uploadImage={(file) => uploadImageToVercelBlob(file, "did-you-know")}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fun Fact?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fun fact? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DidYouKnowPage;

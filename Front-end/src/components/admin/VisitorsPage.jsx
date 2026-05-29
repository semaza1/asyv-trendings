import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users } from "lucide-react";
import { ContentCard } from "@/components/admin/ContentCard";
import { AddEditVisitorsModal } from "@/components/admin/AddEditVisitorsModal";
import { uploadImageToVercelBlob } from "@/utils/vercelBlobUpload";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const VISITORS_API_URL = `${API_BASE_URL}/api/visitors`;

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Convert API response to ContentItem
  const convertApiItemToContentItem = (apiItem) => ({
    id: apiItem._id,
    title: apiItem.title,
    description: apiItem.description,
    category: apiItem.category || "Visitors",
    publishDate: new Date(apiItem.publishedDate),
        image: apiItem.image,
    tags: apiItem.tags || [],
    content: apiItem.content || [],
  });

  // Fetch visitors from API
  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(VISITORS_API_URL);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        const converted = result.data.map(convertApiItemToContentItem);
        setVisitors(converted);
      } else {
        throw new Error(result.message || "Failed to fetch visitors");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const filteredVisitors = visitors.filter(
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

  const createVisitor = async (data) => {
    const payload = {
      ...data,
      publishedDate: data.publishDate
        ? data.publishDate.toISOString()
        : new Date().toISOString(),
      content: data.content || [],
    };
    const response = await fetch(VISITORS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to create visitor");
    await fetchVisitors();
    return result.data;
  };

  const updateVisitor = async (id, data) => {
    const payload = {
      ...data,
      publishedDate: data.publishDate
        ? data.publishDate.toISOString()
        : new Date().toISOString(),
      content: data.content || [],
    };
    const response = await fetch(`${VISITORS_API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to update visitor");
    await fetchVisitors();
    return result.data;
  };

  const deleteVisitor = async (id) => {
    const response = await fetch(`${VISITORS_API_URL}/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to delete visitor");
    await fetchVisitors();
  };

  const handleDelete = async (id) => {
    try {
      await deleteVisitor(id);
      toast({
        title: "Visitor Deleted",
        description: "The visitor was deleted successfully.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete visitor");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete visitor",
        variant: "destructive",
      });
    }
  };

  
  const handleSubmit = async (data) => {
    try {
      setError(null);
      if (editingItem) {
        await updateVisitor(editingItem.id, data);
        toast({
          title: "Visitor Updated",
          description: "The visitor was updated successfully.",
        });
      } else {
        await createVisitor(data);
        toast({
          title: "Visitor Added",
          description: "The visitor was added successfully.",
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save visitor");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save visitor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Visitors Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage upcoming visitors and guests
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-primary text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Visitor</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search visitors..."
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
          <Users className="w-3 h-3 mr-1" />
          Total: {visitors.length}
        </Badge>
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading visitors...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
          <Button onClick={fetchVisitors} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredVisitors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredVisitors.map((item) => (
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
          <p className="text-muted-foreground">No visitors found</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Visitor
          </Button>
        </div>
      )}

      <AddEditVisitorsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={editingItem}
        uploadImage={(file) => uploadImageToVercelBlob(file, "visitors")}
      />
    </div>
  );
};

export default VisitorsPage;

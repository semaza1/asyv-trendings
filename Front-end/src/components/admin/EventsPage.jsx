import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Loader2 } from "lucide-react";
import { ContentCard } from "@/components/admin/ContentCard";
import { AddEditEventsModal } from "@/components/admin/AddEditEventsModal";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToVercelBlob } from "@/utils/vercelBlobUpload";

const apiBaseUrl = import.meta.env.VITE_API_URL;

// Ensure only valid content blocks are sent to the API with correct literal types
const sanitizeContent = (blocks) => {
  if (!Array.isArray(blocks)) return [];
  const cleaned = blocks
    .filter(
      (b) =>
        (b &&
          b.type === "paragraph" &&
          typeof b.text === "string" &&
          b.text.trim().length > 0) ||
        (b &&
          b.type === "image" &&
          typeof b.url === "string" &&
          b.url.trim().length > 0) ||
        (b &&
          b.type === "pdf" &&
          typeof b.url === "string" &&
          b.url.trim().length > 0),
    )
    .map((b) => {
      if (b.type === "paragraph") {
        return { type: "paragraph", text: String(b.text).trim() };
      }
      if (b.type === "pdf") {
        return {
          type: "pdf",
          url: String(b.url).trim(),
          title: b.title ? String(b.title).trim() : "Download PDF",
        };
      }
      return {
        type: "image",
        url: String(b.url).trim(),
        ...(b.caption ? { caption: String(b.caption).trim() } : {}),
        ...(b.alt ? { alt: String(b.alt).trim() } : {}),
      };
    });
  return cleaned;
};

// API base URL for events
const API_BASE_URL = import.meta.env.VITE_API_URL;
const EVENTS_API_URL = `${API_BASE_URL}/api/events`;

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Convert API response to ContentItem format
  const convertApiItemToContentItem = (apiItem) => ({
    id: apiItem._id,
    title: apiItem.title,
    description: apiItem.description,
    category: apiItem.category || "Events",
    publishDate: new Date(apiItem.publishedDate),
        image: apiItem.image,
    tags: apiItem.tags || [],
    location: apiItem.location,
    content: apiItem.content || [],
  });

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(EVENTS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        const convertedEvents = result.data.map(convertApiItemToContentItem);
        setEvents(convertedEvents);
      } else {
        throw new Error(result.message || "Failed to fetch events");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Placeholder handlers for now (to be replaced with API logic)
  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const createEvent = async (data) => {
    const response = await fetch(EVENTS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to create event");
    await fetchEvents();
    return result.data;
  };

  const updateEvent = async (id, data) => {
    const response = await fetch(`${EVENTS_API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to update event");
    await fetchEvents();
    return result.data;
  };

  const deleteEvent = async (id) => {
    const response = await fetch(`${EVENTS_API_URL}/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Failed to delete event");
    await fetchEvents();
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  };

  
  const handleSubmit = async (data) => {
    try {
      setError(null);
      let imageUrl = data.image;
      // If image is a File, upload to Appwrite
      if (
        data.image &&
        typeof data.image !== "string" &&
        typeof File !== "undefined" &&
        data.image instanceof File
      ) {
        imageUrl = await uploadImageToVercelBlob(data.image, "events");
      }
      const payload = {
        ...data,
        image: imageUrl,
        publishedDate: data.publishDate
          ? data.publishDate.toISOString()
          : new Date().toISOString(),
        content: sanitizeContent(data.content),
      };
      if (editingItem) {
        await updateEvent(editingItem.id, payload);
        toast({
          title: "Event Updated",
          description: "The event was updated successfully.",
        });
      } else {
        await createEvent(payload);
        toast({
          title: "Event Posted",
          description: "The event was posted successfully.",
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading events...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchEvents} variant="outline">
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
            Events Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage school events and activities
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-primary text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Event</span>
          <span className="sm:hidden">Add Event</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search events..."
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
          <Calendar className="w-3 h-3 mr-1" />
          Total: {events.length}
        </Badge>
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          
        </Badge>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.map((item) => (
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
          <p className="text-muted-foreground">No events found</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Event
          </Button>
        </div>
      )}

      <AddEditEventsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={editingItem}
        uploadImage={(file) => uploadImageToVercelBlob(file, "events")}
      />
    </div>
  );
};

export default EventsPage;

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
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { ContentCard } from "@/components/admin/ContentCard";
import { AddEditNewsModal } from "@/components/admin/AddEditNewsModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Image compression utility
const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };
    img.src = URL.createObjectURL(file);
  });
};

// Base64 size calculator
const getBase64Size = (base64String) => {
  const base64Data = base64String.split(",")[1] || base64String;
  return Math.round(base64Data.length * 0.75);
};

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Convert API response to ContentItem format
  const convertApiItemToContentItem = (apiItem) => ({
    id: apiItem._id,
    title: apiItem.title,
    description: apiItem.description,
    category: "News", // Fixed category as per your modal
    publishDate: new Date(apiItem.publishedDate),
        image: apiItem.image,
    tags: apiItem.tags,
    content: apiItem.content,
  });

  // Fetch news from API
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/trending-news`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        const convertedNews = result.data.map(convertApiItemToContentItem);
        setNews(convertedNews);
      } else {
        throw new Error(result.message || "Failed to fetch news");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load news on component mount
  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ;
    return matchesSearch && matchesCategory;
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
    const article = news.find((item) => item.id === id);
    const confirmed = await new Promise((resolve) => {
      const dialog = document.createElement("div");
      dialog.className =
        "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
      dialog.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <h3 class="text-lg font-semibold mb-2">Delete Article</h3>
        <p class="text-gray-600 mb-4">Are you sure you want to delete "${article?.title || "this article"}"? This action cannot be undone.</p>
        <div class="flex gap-3 justify-end">
          <button id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button id="confirm-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
        </div>
      </div>
    `;
      document.body.appendChild(dialog);
      const cancelBtn = dialog.querySelector("#cancel-btn");
      const confirmBtn = dialog.querySelector("#confirm-btn");
      const cleanup = () => {
        document.body.removeChild(dialog);
      };
      cancelBtn?.addEventListener("click", () => {
        cleanup();
        resolve(false);
      });
      confirmBtn?.addEventListener("click", () => {
        cleanup();
        resolve(true);
      });
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
          cleanup();
          resolve(false);
        }
      });
    });

    if (confirmed) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/trending-news/${id}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setNews((prev) => prev.filter((item) => item.id !== id));
        } else {
          throw new Error(result.message || "Failed to delete news");
        }
      } catch (err) {
        console.error("Error deleting news:", err);
        alert("Failed to delete article. Please try again.");
      }
    }
  };

  
  const validatePayloadSize = (payload) => {
    const jsonString = JSON.stringify(payload);
    const sizeInBytes = new TextEncoder().encode(jsonString).length;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    const errors = [];
    // Check overall payload size (assuming 16MB limit, but being conservative with 10MB)
    if (sizeInMB > 10) {
      errors.push(`Payload too large: ${sizeInMB.toFixed(2)}MB (max 10MB)`);
    }
    // Check image size specifically if it's base64
    if (payload.image && payload.image.startsWith("data:image")) {
      const imageSizeBytes = getBase64Size(payload.image);
      const imageSizeMB = imageSizeBytes / (1024 * 1024);
      if (imageSizeMB > 5) {
        errors.push(`Image too large: ${imageSizeMB.toFixed(2)}MB (max 5MB)`);
      }
    }
    // Check text field lengths
    if (payload.title && payload.title.length > 200) {
      errors.push("Title too long (max 200 characters)");
    }
    if (payload.description && payload.description.length > 5000) {
      errors.push("Description too long (max 5000 characters)");
    }
    return {
      isValid: errors.length === 0,
      size: sizeInBytes,
      errors,
    };
  };

  // Enhanced handleSubmit function with better error handling and debugging
  const handleSubmit = async (data) => {
    try {
      let processedImage = data.image;
      // Debug: Log the incoming data
      console.log("📝 Form data received:", {
        title: data.title,
        description: data.description?.substring(0, 100) + "...",
        category: data.category,
        publishDate: data.publishDate,
                tags: data.tags,
        hasImage: !!data.image,
        imageType: data.image?.substring(0, 20),
      });
      // If image is a base64 string, try to compress it
      if (processedImage && processedImage.startsWith("data:image")) {
        const imageSizeBytes = getBase64Size(processedImage);
        const imageSizeMB = imageSizeBytes / (1024 * 1024);
        console.log(`🖼️ Original image size: ${imageSizeMB.toFixed(2)}MB`);
        // If image is larger than 2MB, try to compress it
        if (imageSizeMB > 2) {
          try {
            // Convert base64 to blob, then to file for compression
            const response = await fetch(processedImage);
            const blob = await response.blob();
            const file = new File([blob], "image.jpg", { type: "image/jpeg" });
            // Compress with progressively lower quality
            let quality = 0.8;
            let compressedImage = processedImage;
            while (quality > 0.1) {
              compressedImage = await compressImage(file, 800, quality);
              const compressedSize =
                getBase64Size(compressedImage) / (1024 * 1024);
              console.log(
                `🗜️ Compressed to ${compressedSize.toFixed(2)}MB at quality ${quality}`,
              );
              if (compressedSize <= 2) break;
              quality -= 0.1;
            }
            processedImage = compressedImage;
          } catch (compressionError) {
            console.warn("⚠️ Image compression failed:", compressionError);
            alert("Image compression failed. The image might be too large.");
          }
        }
      }

      // Create API payload with validation
      const apiPayload = {
        title: data.title?.trim()?.substring(0, 200) || "", // Ensure title exists and is trimmed
        description: data.description?.trim()?.substring(0, 5000) || "", // Ensure description exists
        category: (data.category?.toLowerCase() || "news").trim(), // Ensure category is lowercase
        image: processedImage || "", // Ensure image exists
        tags: Array.isArray(data.tags)
          ? data.tags.filter((tag) => tag && tag.trim())
          : [], // Clean tags array
        publishedDate: data.publishDate
          ? data.publishDate.toISOString()
          : new Date().toISOString(), // Ensure valid date
                content: data.content || [],
      };

      // Additional validation before sending
      const validationErrors = [];
      if (!apiPayload.title.trim()) {
        validationErrors.push("Title is required");
      }
      if (!apiPayload.description.trim()) {
        validationErrors.push("Description is required");
      }
      if (!apiPayload.image) {
        validationErrors.push("Featured image is required");
      }
      // Check for valid date
      if (isNaN(new Date(apiPayload.publishedDate).getTime())) {
        validationErrors.push("Invalid publish date");
        apiPayload.publishedDate = new Date().toISOString();
      }
      if (validationErrors.length > 0) {
        alert("Validation errors:\n" + validationErrors.join("\n"));
        return;
      }

      // Validate payload size before sending
      const validation = validatePayloadSize(apiPayload);
      if (!validation.isValid) {
        const errorMessage = `Cannot submit article:\n${validation.errors.join("\n")}`;
        alert(errorMessage);
        console.error("❌ Payload validation failed:", validation);
        return;
      }

      console.log(`📊 Payload size: ${(validation.size / 1024).toFixed(2)}KB`);
      console.log("📤 API Payload structure:", {
        title: apiPayload.title.substring(0, 50) + "...",
        description: apiPayload.description.substring(0, 50) + "...",
        category: apiPayload.category,
        imageSize: processedImage
          ? `${(getBase64Size(processedImage) / 1024).toFixed(2)}KB`
          : "No image",
        tagsCount: apiPayload.tags.length,
        publishedDate: apiPayload.publishedDate,
              });

      const url = editingItem
        ? `${API_BASE_URL}/api/trending-news/${editingItem.id}`
        : `${API_BASE_URL}/api/trending-news`;
      const method = editingItem ? "PUT" : "POST";
      console.log(`🌐 Making ${method} request to: ${url}`);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      console.log(
        `📡 Response status: ${response.status} ${response.statusText}`,
      );

      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      console.log("📥 Response text:", responseText);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        // Try to parse error response
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.errors) {
            // Handle validation errors array
            if (Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors
                .map((err) =>
                  typeof err === "string"
                    ? err
                    : err.message || err.msg || JSON.stringify(err),
                )
                .join("\n");
            } else {
              errorMessage = JSON.stringify(errorData.errors);
            }
          }
        } catch (parseError) {
          console.warn("⚠️ Could not parse error response as JSON");
          errorMessage += `\nResponse: ${responseText.substring(0, 200)}`;
        }

        if (response.status === 400) {
          errorMessage = `Bad Request: ${errorMessage}\n\nThis usually means the server rejected the data format. Check the console for more details.`;
        } else if (response.status === 413) {
          errorMessage =
            "The article data is too large. Please reduce the image size or content length.";
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Server returned invalid JSON response");
      }
      if (result.success) {
        const processedItem = convertApiItemToContentItem(result.data);
        if (editingItem) {
          setNews((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? processedItem : item,
            ),
          );
          console.log("✅ Article updated successfully");
        } else {
          setNews((prev) => [...prev, processedItem]);
          console.log("✅ Article created successfully");
        }
        setIsModalOpen(false);
      } else {
        throw new Error(
          result.message ||
            `Failed to ${editingItem ? "update" : "create"} news`,
        );
      }
    } catch (err) {
      console.error("❌ Error submitting news:", err);
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      // Show detailed error to user
      alert(
        `Failed to ${editingItem ? "update" : "create"} article:\n\n${errorMessage}\n\nCheck the browser console for more details.`,
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading news articles...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchNews} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            News Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage news articles and announcements
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-primary text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add News Article</span>
          <span className="sm:hidden">Add Article</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search news articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Articles</SelectItem>
            <SelectItem value="true">Featured Only</SelectItem>
            <SelectItem value="false">Regular Articles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 sm:gap-4">
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          Total: {news.length}
        </Badge>
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          
        </Badge>
        <Badge
          variant="outline"
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          This Month:{" "}
          {
            news.filter((item) => {
              const now = new Date();
              return (
                item.publishDate.getMonth() === now.getMonth() &&
                item.publishDate.getFullYear() === now.getFullYear()
              );
            }).length
          }
        </Badge>
      </div>

      {/* Content Grid */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredNews.map((item) => (
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
          <p className="text-muted-foreground">No news articles found</p>
          <Button onClick={handleAdd} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Article
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddEditNewsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        initialData={editingItem}
      />
    </div>
  );
};

export default NewsPage;

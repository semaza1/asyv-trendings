import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ContentBuilder from "./ContentBuilder";
import axios from "axios";
import { uploadImageToVercelBlob } from "@/utils/vercelBlobUpload";

// API category options based on your model
const categories = [
  { value: "news", label: "News" },
  { value: "business", label: "Business" },
  { value: "health", label: "Health" },
  { value: "science", label: "Science" },
  { value: "politics", label: "Politics" },
  { value: "entertainment", label: "Entertainment" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
];



export const AddEditNewsModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "news",
    publishDate: new Date(),
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Content builder state
  const [contentBlocks, setContentBlocks] = useState([]);
  const [newParagraph, setNewParagraph] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [newImageUrl, setNewImageUrl] = useState(null);
  // Time picker state (HH:MM)
  const [publishTime, setPublishTime] = useState("12:00");

  const toTimeString = (d) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  const combineDateTime = (date, time) => {
    const [hh, mm] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hh || 0, mm || 0, 0, 0);
    return combined;
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Convert category back to lowercase for API compatibility
        category: "news",
      });
      setImagePreview(initialData.image || null);
      setContentBlocks(initialData.content || []);
      if (initialData.publishDate) {
        setPublishTime(toTimeString(initialData.publishDate));
      } else {
        setPublishTime(toTimeString(new Date()));
      }
    } else {
      setFormData({
        title: "",
        description: "",
        category: "news",
        publishDate: new Date(),
        tags: [],
      });
      setImagePreview(null);
      setContentBlocks([]);
      setPublishTime(toTimeString(new Date()));
    }
    setTagInput("");
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.title?.trim()) {
      alert("Title is required");
      return;
    }
    if (!formData.description?.trim()) {
      alert("Description is required");
      return;
    }
    if (!imagePreview) {
      alert("Featured image is required");
      return;
    }

    // Combine date + time for publishDate
    const publishDateCombined = combineDateTime(
      formData.publishDate || new Date(),
      publishTime,
    );

    onSubmit({
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
      image: imagePreview,
      publishDate: publishDateCombined,
      category: "news", // Ensure category is explicitly set
      content: contentBlocks,
    });
    onOpenChange(false);
  };

  const addTag = () => {
    if (
      tagInput.trim() &&
      !formData.tags?.includes(tagInput.trim().toLowerCase())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim().toLowerCase()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB for Vercel Blob)
      if (file.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB");
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      setUploading(true);
      try {
        const url = await uploadImageToVercelBlob(file, "news");
        setImagePreview(url);
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Image upload failed. Please try again.";
        alert(errorMsg);
      }
      setUploading(false);
    }
  };

  // Upload helper dedicated for image block in content
  const handleContentImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImageToVercelBlob(file, "news-content");
      setNewImageUrl(url);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Image upload failed. Please try again.";
      alert(errorMsg);
    }
    setUploading(false);
  };

  const addParagraphBlock = () => {
    const text = newParagraph.trim();
    if (!text) return;
    setContentBlocks((prev) => [...prev, { type: "paragraph", text }]);
    setNewParagraph("");
  };

  const addImageBlock = () => {
    if (!newImageUrl) {
      alert("Please upload an image for the content block");
      return;
    }
    setContentBlocks((prev) => [
      ...prev,
      {
        type: "image",
        url: newImageUrl,
        caption: newImageCaption.trim() || undefined,
      },
    ]);
    setNewImageUrl(null);
    setNewImageCaption("");
  };

  const removeBlock = (index) => {
    setContentBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  // Insert a block below given index
  const insertBlockBelow = (index, block) => {
    setContentBlocks((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, block);
      return copy;
    });
  };

  // Move block up/down
  const moveBlock = (index, direction) => {
    setContentBlocks((prev) => {
      const copy = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[newIndex];
      copy[newIndex] = temp;
      return copy;
    });
  };

  // Replace image at index via Vercel Blob upload
  const replaceImageAt = async (index, file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImageToVercelBlob(file, "news-content");
      setContentBlocks((prev) =>
        prev.map((b, i) =>
          i === index && b.type === "image" ? { ...b, url } : b,
        ),
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Image upload failed. Please try again.";
      alert(errorMsg);
    }
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit" : "Add New"} News Article
          </DialogTitle>
          <DialogDescription>
            Fill in the details for your news article.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter news title..."
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value="News" disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Write your news article content..."
              rows={4}
              required
              maxLength={2000}
            />

            <p className="text-xs text-muted-foreground">
              {formData.description?.length || 0}/2000 characters
            </p>
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label>Featured Image *</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />

                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Featured Image"}
                </Label>
              </div>
              {imagePreview && (
                <div className="relative w-20 h-20 rounded-lg border border-border overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    onClick={() => setImagePreview(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            {!imagePreview && (
              <p className="text-xs text-red-500">Featured image is required</p>
            )}
          </div>

          {/* Content Builder */}
          <div className="space-y-2">
            <ContentBuilder
              value={contentBlocks}
              onChange={setContentBlocks}
              uploadImage={(file) => uploadImageToVercelBlob(file, "news")}
              isEditing
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag (e.g. science, achievement, sports)..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />

              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
          </div>

          {/* Publish Date */}
          <div className="space-y-2">
            <Label>Publish Date</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.publishDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.publishDate ? (
                      format(formData.publishDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.publishDate}
                    onSelect={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        publishDate: date || new Date(),
                      }))
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <div>
                <Input
                  type="time"
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Articles scheduled in the future will go live automatically at
              the selected date and time.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary text-white">
              {initialData ? "Update" : "Create"} Article
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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
import { CalendarIcon, X, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ContentBuilder from "./ContentBuilder";

const projectCategories = ["project"];

export const AddEditProjectModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  uploadImage,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "project",
    description: "",
    image: undefined,
    developerName: "",
    projectLink: "",
    tags: [],
    publishDate: new Date(),
  });
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [publishTime, setPublishTime] = useState(format(new Date(), "HH:mm"));
  const [contentBlocks, setContentBlocks] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.image || null);
      setPublishTime(
        format(new Date(initialData.publishDate || new Date()), "HH:mm"),
      );
      setContentBlocks(initialData.content || []);
    } else {
      setFormData({
        title: "",
        category: "project",
        description: "",
        image: undefined,
        developerName: "",
        projectLink: "",
        tags: [],
        publishDate: new Date(),
      });
      setImagePreview(null);
    }
    setUploading(false);
    setUploadError(null);
    if (!initialData) {
      setPublishTime(format(new Date(), "HH:mm"));
    }
    if (!initialData) setContentBlocks([]);
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (uploading) return; // Prevent submit while uploading
    // Combine selected date and time for publishDate
    const combinedDate = new Date(formData.publishDate || new Date());
    const [h, m] = (publishTime || "00:00").split(":").map(Number);
    combinedDate.setHours(h || 0, m || 0, 0, 0);
    onSubmit({
      ...formData,
      publishDate: combinedDate,
      id: initialData?.id || crypto.randomUUID(),
      image: formData.image || undefined,
      content: contentBlocks,
    });
    onOpenChange(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        setUploadError("Image size exceeds 5MB limit.");
        return;
      }
      if (!file.type.match("image.*")) {
        setUploadError("Only image files are allowed.");
        return;
      }
      setUploading(true);
      setUploadError(null);
      setImagePreview(null);
      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        // Upload to Appwrite
        const url = await uploadImage(file);
        setFormData((prev) => ({ ...prev, image: url }));
      } catch (err) {
        setUploadError("Failed to upload image. Please try again.");
        setFormData((prev) => ({ ...prev, image: undefined }));
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add New"} Project</DialogTitle>
          <DialogDescription>
            Fill in the details for your project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter project title..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value="project"
                disabled
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description..."
              rows={3}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />

                <Label
                  htmlFor="image-upload"
                  className={`flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Image"}
                </Label>
                {uploadError && (
                  <div className="text-red-600 text-xs mt-1">{uploadError}</div>
                )}
              </div>
              {imagePreview && (
                <div className="w-20 h-20 rounded-lg border border-border overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {uploading && (
                <Loader2 className="w-6 h-6 animate-spin ml-2 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Rich Content Builder */}
          <div className="space-y-2">
            <ContentBuilder
              value={contentBlocks}
              onChange={setContentBlocks}
              uploadImage={uploadImage}
              isEditing
            />
          </div>

          {/* Developer Name & Project Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="developer-name">Developer Name(s)</Label>
              <Input
                id="developer-name"
                value={formData.developerName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    developerName: e.target.value,
                  }))
                }
                placeholder="Student name(s)..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-link">Project Link</Label>
              <Input
                id="project-link"
                value={formData.projectLink}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    projectLink: e.target.value,
                  }))
                }
                placeholder="https://..."
                type="url"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
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
                placeholder="Add tag..."
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
            <div className="space-y-2 mt-2">
              <Label>Publish Time</Label>
              <Input
                type="time"
                value={publishTime}
                onChange={(e) => setPublishTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary text-white"
              disabled={uploading || !formData.image}
            >
              {uploading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </span>
              ) : (
                (initialData ? "Update" : "Create") + " Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditProjectModal;

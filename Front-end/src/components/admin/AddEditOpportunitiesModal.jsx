import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import ContentBuilder from "./ContentBuilder";

const categories = [
  "Opportunities",
  "Scholarship",
  "Internship",
  "Grant",
  "Competition",
  "Other",
];

// Image uploads are handled by the parent via uploadImage prop

export const AddEditOpportunitiesModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  uploadImage,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Opportunities", // Set default and fixed category
    description: "",
    deadline: undefined,
    applicationLink: "",
    image: "",
    publishDate: new Date(),
    tags: [],
    ...initialData,
  });
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [uploading, setUploading] = useState(false);
  const [publishTime, setPublishTime] = useState(format(new Date(), "HH:mm"));
  const [contentBlocks, setContentBlocks] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData, category: "Opportunities" });
      setImagePreview(initialData.image || null);
      setPublishTime(
        format(new Date(initialData.publishDate || new Date()), "HH:mm"),
      );
      // @ts-ignore initialData may not carry content in this local type; fallback to any
      setContentBlocks(initialData.content || []);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.applicationLink) {
      alert("Application link is required");
      return;
    }
    if (formData.title.length > 200) {
      alert("Title too long (max 200 characters)");
      return;
    }
    if (formData.description.length > 5000) {
      alert("Description too long (max 5000 characters)");
      return;
    }
    if (!imagePreview) {
      alert("Image is required");
      return;
    }
    // No need for payload size validation since only URL is stored
    // Combine selected date and time for publishDate
    const combinedDate = new Date(formData.publishDate || new Date());
    const [h, m] = (publishTime || "00:00").split(":").map(Number);
    combinedDate.setHours(h || 0, m || 0, 0, 0);
    onSubmit({
      ...formData,
      image: imagePreview || undefined,
      publishDate: combinedDate,
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
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      setUploading(true);
      try {
        const url = await uploadImage(file);
        setImagePreview(url);
      } catch (err) {
        alert("Image upload failed. Please try again.");
      }
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Opportunity</DialogTitle>
          <DialogDescription>
            Fill in the details for the opportunity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, title: e.target.value }))
                }
                required
                placeholder="Enter opportunity title..."
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value="Opportunities"
                readOnly
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((f) => ({ ...f, description: e.target.value }))
              }
              required
              placeholder="Enter a brief description of the opportunity..."
              maxLength={5000}
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
                />

                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Image"}
                </Label>
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

          {/* Rich Content Builder */}
          <div className="space-y-2">
            <ContentBuilder
              value={contentBlocks}
              onChange={setContentBlocks}
              uploadImage={uploadImage}
              isEditing
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Application Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.deadline && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? (
                      format(formData.deadline, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) =>
                      setFormData((f) => ({ ...f, deadline: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Application Link</Label>
              <Input
                value={formData.applicationLink}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    applicationLink: e.target.value,
                  }))
                }
                placeholder="https://..."
                required
              />
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
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={formData.publishDate}
                  onSelect={(date) =>
                    setFormData((f) => ({
                      ...f,
                      publishDate: date || new Date(),
                    }))
                  }
                  initialFocus
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
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update" : "Create"} Opportunity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditOpportunitiesModal;

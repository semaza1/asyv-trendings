import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImagePlus,
  FileText,
  Link as LinkIcon,
} from "lucide-react";

export default function ContentBuilder({
  value,
  onChange,
  uploadImage,
  isEditing = false,
  onUploadingChange,
}) {
  const [uploading, setUploading] = useState(false);

  // Modals visibility
  const [isParagraphModalOpen, setIsParagraphModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Modals inputs
  const [modalParagraph, setModalParagraph] = useState("");
  const [modalImageFile, setModalImageFile] = useState(null);
  const [modalImageCaption, setModalImageCaption] = useState("");
  const [modalPdfFile, setModalPdfFile] = useState(null);
  const [modalPdfTitle, setModalPdfTitle] = useState("");
  const [modalLinkUrl, setModalLinkUrl] = useState("");
  const [modalLinkText, setModalLinkText] = useState("");

  // Upload PDF to backend server (via Vercel Blob)
  const uploadPdf = async (file) => {
    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:5000";
    const formData = new FormData();
    formData.append("pdf", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s for PDFs
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/pdf`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "PDF upload failed");
      }

      const data = await response.json();
      return data.data.url;
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("PDF upload timed out. Please try a smaller file.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };

  const handleAddParagraph = () => {
    const text = modalParagraph.trim();
    if (!text) return;
    onChange([...(value || []), { type: "paragraph", text }]);
    setModalParagraph("");
    setIsParagraphModalOpen(false);
  };

  const handleAddImage = async () => {
    if (!modalImageFile) return alert("Please select an image");
    if (!modalImageFile.type.startsWith("image/"))
      return alert("Please select a valid image file");
    if (modalImageFile.size > 5 * 1024 * 1024)
      return alert("File size must be less than 5MB");

    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadImage(modalImageFile);
      onChange([
        ...(value || []),
        { type: "image", url, caption: modalImageCaption.trim() || undefined },
      ]);
      setModalImageFile(null);
      setModalImageCaption("");
      setIsImageModalOpen(false);
    } catch (e) {
      alert("Image upload failed. Please try again.");
    }
    setUploading(false);
    onUploadingChange?.(false);
  };

  const handleAddDocument = async () => {
    if (!modalPdfFile) return alert("Please select a document");
    if (modalPdfFile.size > 10 * 1024 * 1024) {
      return alert("PDF file size must be less than 10MB");
    }
    if (modalPdfFile.type !== "application/pdf") {
      return alert("Please select a valid PDF file");
    }

    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadPdf(modalPdfFile);
      const title = modalPdfTitle.trim() || modalPdfFile.name;
      onChange([
        ...(value || []),
        { type: "pdf", url, title, fileName: modalPdfFile.name },
      ]);
      setModalPdfFile(null);
      setModalPdfTitle("");
      setIsDocumentModalOpen(false);
    } catch (e) {
      alert(`PDF upload failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
    setUploading(false);
    onUploadingChange?.(false);
  };

  const handleAddLink = () => {
    const url = modalLinkUrl.trim();
    const text = modalLinkText.trim() || url;
    if (!url) return;
    onChange([...(value || []), { type: "link", url, text }]);
    setModalLinkUrl("");
    setModalLinkText("");
    setIsLinkModalOpen(false);
  };

  const removeBlock = (index) => {
    onChange((value || []).filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction) => {
    const copy = [...(value || [])];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= copy.length) return;
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;
    onChange(copy);
  };

  const replaceImageAt = async (index, file) => {
    if (!file.type.startsWith("image/"))
      return alert("Please select a valid image file");
    if (file.size > 5 * 1024 * 1024)
      return alert("File size must be less than 5MB");
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadImage(file);
      onChange(
        value.map((b, i) =>
          i === index && b.type === "image" ? { ...b, url } : b,
        ),
      );
    } catch (e) {
      alert("Image upload failed. Please try again.");
    }
    setUploading(false);
    onUploadingChange?.(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-lg font-semibold text-foreground">Content Builder & Live Preview</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Build your content below. The changes you see here simulate how it will look on the live site.
          </p>
        </div>

        {/* Hover Dropdown Add Button */}
        <div className="relative group inline-block z-10">
          <Button type="button" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Plus className="w-4 h-4" /> Add Block
          </Button>
          <div className="absolute top-full right-0 mt-1 w-48 bg-card border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
            <button type="button" onClick={() => setIsParagraphModalOpen(true)} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors">
              <FileText className="w-4 h-4 text-muted-foreground" /> Paragraph
            </button>
            <button type="button" onClick={() => setIsImageModalOpen(true)} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors">
              <ImagePlus className="w-4 h-4 text-muted-foreground" /> Image
            </button>
            <button type="button" onClick={() => setIsDocumentModalOpen(true)} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors">
              <FileText className="w-4 h-4 text-destructive" /> Document
            </button>
            <button type="button" onClick={() => setIsLinkModalOpen(true)} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors">
              <LinkIcon className="w-4 h-4 text-muted-foreground" /> Link
            </button>
          </div>
        </div>
      </div>

      <div className="bg-background/50 border rounded-xl overflow-hidden min-h-[300px] shadow-sm">
        {value.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p>No content blocks added yet.</p>
            <p className="text-sm">Hover over "Add Block" to start creating rich content.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {value.map((block, index) => (
              <div
                key={index}
                className="group/block relative flex items-start gap-4 rounded-lg hover:bg-muted/30 p-2 -m-2 transition-colors"
              >
                <div className="flex-1 overflow-hidden">
                  {block.type === "paragraph" ? (
                    isEditing ? (
                      <Textarea
                        value={block.text}
                        onChange={(e) =>
                          onChange(
                            value.map((b, i) =>
                              i === index && b.type === "paragraph"
                                ? { ...b, text: e.target.value }
                                : b,
                            ),
                          )
                        }
                        rows={3}
                        className="bg-transparent border-dashed focus-visible:ring-1"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-sm">{block.text}</p>
                    )
                  ) : block.type === "image" ? (
                    <div className="space-y-3 max-w-2xl mx-auto">
                      <div className="relative group/image overflow-hidden rounded-lg border bg-muted/20">
                        <img
                          src={block.url}
                          alt={block.alt || block.caption || "Image"}
                          className="w-full max-h-[500px] object-contain"
                        />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                            <Label className="cursor-pointer bg-background/90 text-foreground px-4 py-2 rounded-md hover:bg-background transition-colors flex items-center gap-2 text-sm">
                              <ImagePlus className="w-4 h-4" /> Replace Image
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  e.target.files?.[0] &&
                                  replaceImageAt(index, e.target.files[0])
                                }
                              />
                            </Label>
                          </div>
                        )}
                      </div>
                      {(isEditing || block.caption) && (
                        isEditing ? (
                          <Input
                            value={block.caption || ""}
                            onChange={(e) =>
                              onChange(
                                value.map((b, i) =>
                                  i === index && b.type === "image"
                                    ? { ...b, caption: e.target.value }
                                    : b,
                                ),
                              )
                            }
                            placeholder="Add a caption..."
                            className="text-center bg-transparent border-dashed text-sm text-muted-foreground max-w-md mx-auto"
                            maxLength={300}
                          />
                        ) : (
                          <p className="text-sm text-center text-muted-foreground italic">
                            {block.caption}
                          </p>
                        )
                      )}
                    </div>
                  ) : block.type === "pdf" ? (
                    <div className="max-w-xl bg-card border rounded-lg overflow-hidden shadow-sm">
                      <div className="flex items-center gap-3 p-4 bg-muted/40 border-b">
                        <FileText className="w-8 h-8 text-destructive flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <Input
                              value={block.title || ""}
                              onChange={(e) =>
                                onChange(
                                  value.map((b, i) =>
                                    i === index && b.type === "pdf"
                                      ? { ...b, title: e.target.value }
                                      : b,
                                  ),
                                )
                              }
                              placeholder="Document Title"
                              className="font-medium bg-transparent border-dashed h-8 px-2 w-full"
                              maxLength={200}
                            />
                          ) : (
                            <h4 className="font-semibold text-foreground truncate" title={block.title || "PDF Document"}>
                              {block.title || "PDF Document"}
                            </h4>
                          )}
                          <a
                            href={block.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            Download / Open PDF
                          </a>
                        </div>
                      </div>
                      <div className="h-64 bg-muted/10 relative border-t">
                        <iframe
                          src={`${block.url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full border-0"
                          title={`PDF Preview: ${block.title || "Document"}`}
                        />
                      </div>
                    </div>
                  ) : block.type === "link" ? (
                    <div className="max-w-md bg-muted/30 border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <LinkIcon className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1 space-y-2">
                          {isEditing ? (
                            <>
                              <Input
                                value={block.text || ""}
                                onChange={(e) =>
                                  onChange(
                                    value.map((b, i) =>
                                      i === index && b.type === "link"
                                        ? { ...b, text: e.target.value }
                                        : b,
                                    ),
                                  )
                                }
                                placeholder="Link text to display"
                                className="h-8 text-sm bg-transparent border-dashed"
                              />
                              <Input
                                value={block.url || ""}
                                onChange={(e) =>
                                  onChange(
                                    value.map((b, i) =>
                                      i === index && b.type === "link"
                                        ? { ...b, url: e.target.value }
                                        : b,
                                    ),
                                  )
                                }
                                placeholder="https://example.com"
                                className="h-8 text-sm bg-transparent border-dashed text-muted-foreground"
                              />
                            </>
                          ) : (
                            <a
                              href={block.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-medium hover:underline flex items-center gap-1"
                            >
                              {block.text || block.url}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {isEditing && (
                  <div className="flex flex-col gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity flex-shrink-0 bg-background/80 backdrop-blur-sm p-1 rounded-md border shadow-sm absolute right-2 top-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => moveBlock(index, "up")}
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => moveBlock(index, "down")}
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeBlock(index)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals for Adding Blocks */}
      <Dialog open={isParagraphModalOpen} onOpenChange={setIsParagraphModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Paragraph</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="paragraphText" className="mb-2 block">Text Content</Label>
            <Textarea
              id="paragraphText"
              value={modalParagraph}
              onChange={(e) => setModalParagraph(e.target.value)}
              placeholder="Write your content here..."
              rows={6}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsParagraphModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddParagraph}>Save Paragraph</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="imageFile" className="mb-2 block">Upload Image</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => setModalImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label htmlFor="imageCaption" className="mb-2 block">Caption (Optional)</Label>
              <Input
                id="imageCaption"
                value={modalImageCaption}
                onChange={(e) => setModalImageCaption(e.target.value)}
                placeholder="A descriptive caption..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageModalOpen(false)} disabled={uploading}>Cancel</Button>
            <Button onClick={handleAddImage} disabled={uploading || !modalImageFile}>
              {uploading ? "Uploading..." : "Save Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="pdfFile" className="mb-2 block">Upload PDF</Label>
              <Input
                id="pdfFile"
                type="file"
                accept="application/pdf"
                onChange={(e) => setModalPdfFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label htmlFor="pdfTitle" className="mb-2 block">Document Title</Label>
              <Input
                id="pdfTitle"
                value={modalPdfTitle}
                onChange={(e) => setModalPdfTitle(e.target.value)}
                placeholder="E.g., Syllabus 2026"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDocumentModalOpen(false)} disabled={uploading}>Cancel</Button>
            <Button onClick={handleAddDocument} disabled={uploading || !modalPdfFile}>
              {uploading ? "Uploading..." : "Save Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="linkUrl" className="mb-2 block">URL</Label>
              <Input
                id="linkUrl"
                value={modalLinkUrl}
                onChange={(e) => setModalLinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="linkText" className="mb-2 block">Link Text</Label>
              <Input
                id="linkText"
                value={modalLinkText}
                onChange={(e) => setModalLinkText(e.target.value)}
                placeholder="Click here to read more"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLink} disabled={!modalLinkUrl}>Save Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

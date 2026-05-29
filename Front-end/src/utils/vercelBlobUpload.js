/**
 * Upload image to Vercel Blob via backend API
 * @param file - File object to upload
 * @param folder - Optional folder path (e.g., 'news', 'events')
 * @returns Full URL to the uploaded file
 */
export const uploadImageToVercelBlob = async (file, folder = "images") => {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error(
        `File size exceeds 50MB limit. Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Validate file type - accept all image types
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file");
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    // Get API base URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Upload via backend API
    const response = await fetch(`${apiBaseUrl}/api/upload/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload image");
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Upload failed");
    }

    console.log("✅ Image uploaded successfully:", result.data.url);
    return result.data.url;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
};

/**
 * Delete image from Vercel Blob
 * @param url - Full URL of the blob to delete
 */
export const deleteImageFromVercelBlob = async (url) => {
  try {
    // Call your backend API to delete
    const response = await fetch("/api/upload/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete image");
    }

    console.log("✅ Image deleted successfully");
  } catch (error) {
    console.error("❌ Delete failed:", error);
    throw error;
  }
};

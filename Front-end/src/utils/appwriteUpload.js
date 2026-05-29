import { storage, APPWRITE_BUCKET_ID } from "@/config/appwrite";
import { ID } from "appwrite";

/**
 * Upload image to Appwrite storage
 * @param file - File object to upload
 * @returns Promise with the file URL
 */
export const uploadToAppwrite = async (file) => {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 10MB");
    }

    // Upload file to Appwrite
    const response = await storage.createFile(
      APPWRITE_BUCKET_ID,
      ID.unique(),
      file,
    );

    // Generate the file URL
    const fileUrl = storage.getFileView(APPWRITE_BUCKET_ID, response.$id);
    return fileUrl.toString();
  } catch (error) {
    console.error("Appwrite upload error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload image to Appwrite");
  }
};

/**
 * Delete image from Appwrite storage
 * @param fileId - File ID to delete
 */
export const deleteFromAppwrite = async (fileId) => {
  try {
    await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
  } catch (error) {
    console.error("Appwrite delete error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete image from Appwrite");
  }
};

/**
 * Extract file ID from Appwrite URL
 * @param url - Appwrite file URL
 * @returns File ID
 */
export const extractFileIdFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const fileId = urlObj.searchParams.get("fileId");
    return fileId || "";
  } catch {
    return "";
  }
};

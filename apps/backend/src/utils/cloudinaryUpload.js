import cloudinary from "../config/cloudinary.js";

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - Raw file data
 * @param {Object} options
 * @param {string} options.folder       - Cloudinary folder  (default: 'medilab/results')
 * @param {string} options.resourceType - 'image' | 'raw' | 'auto'  (default: 'auto')
 * @param {string} [options.publicId]   - Optional explicit public_id (no extension for images)
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  const { folder = "medilab/results", resourceType = "auto", publicId } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      access_mode: "public",
      unique_filename: true,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.unique_filename = false;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    stream.end(buffer);
  });
};

/**
 * Generate a private API download URL for a stored Cloudinary file.
 * Uses api.cloudinary.com (NOT res.cloudinary.com), authenticated via
 * API key + HMAC signature, so CDN-level delivery restrictions on PDFs
 * and other restricted types are completely bypassed.
 * @param {string} storedUrl - The secure_url stored in the database
 * @returns {string|null} Authenticated API download URL valid for 1 hour, or null
 */
export const getSignedDownloadUrl = (storedUrl) => {
  if (!storedUrl || !storedUrl.includes("res.cloudinary.com")) return null;

  let resourceType, afterUpload;
  for (const rt of ["image", "raw", "video"]) {
    const marker = `/${rt}/upload/`;
    if (storedUrl.includes(marker)) {
      resourceType = rt;
      afterUpload = storedUrl.split(marker)[1];
      break;
    }
  }

  if (!resourceType || !afterUpload) return null;

  // Remove optional version prefix (v1234567890/)
  afterUpload = afterUpload.replace(/^v\d+\//, "");

  // For image/video: split extension so it can be passed as `format`
  // For raw: publicId includes the extension
  const lastDot = afterUpload.lastIndexOf(".");
  const format = (resourceType !== "raw" && lastDot !== -1)
    ? afterUpload.slice(lastDot + 1)
    : "";
  const publicId = (resourceType !== "raw" && lastDot !== -1)
    ? afterUpload.slice(0, lastDot)
    : afterUpload;

  try {
    // private_download_url generates https://api.cloudinary.com/v1_1/.../download?...
    // This uses API credentials, not CDN delivery, so all restrictions are bypassed.
    const url = cloudinary.utils.private_download_url(publicId, format, {
      resource_type: resourceType,
      type: "upload",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    return url;
  } catch (err) {
    console.error("[cloudinary] private_download_url error:", err.message);
    return null;
  }
};

/**
 * Delete a Cloudinary asset using its stored URL.
 * Parses resource_type and public_id from the URL automatically.
 * Safe to call with a local path or null/undefined (no-op).
 * @param {string} url - Cloudinary secure_url
 */
export const deleteFromCloudinaryByUrl = async (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return;

  try {
    let resourceType, afterUpload;

    for (const rt of ["image", "raw", "video"]) {
      const marker = `/${rt}/upload/`;
      if (url.includes(marker)) {
        resourceType = rt;
        afterUpload = url.split(marker)[1];
        break;
      }
    }

    if (!resourceType || !afterUpload) return;

    // Remove optional version prefix (v1234567890/)
    afterUpload = afterUpload.replace(/^v\d+\//, "");

    // For images: public_id does NOT include the file extension
    // For raw:    public_id DOES include the file extension
    const publicId =
      resourceType === "image"
        ? afterUpload.replace(/\.[^.]+$/, "")
        : afterUpload;

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`[Cloudinary] Deleted: ${publicId}`);
  } catch (err) {
    // Non-fatal — log and continue
    console.error("[Cloudinary] Failed to delete file:", err.message);
  }
};

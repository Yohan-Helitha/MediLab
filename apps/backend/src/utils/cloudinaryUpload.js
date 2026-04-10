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
 * Generate a time-limited signed download URL via Cloudinary's API endpoint.
 * Uses api.cloudinary.com (not res.cloudinary.com), so account-level delivery
 * restrictions do not apply — authentication is via HMAC signature.
 * @param {string} storedUrl - The secure_url stored in the database
 * @returns {string|null} Signed download URL valid for 1 hour
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

  // Remove version prefix (v1234567890/)
  afterUpload = afterUpload.replace(/^v\d+\//, "");

  // Split extension from publicId — private_download_url takes them separately
  const lastDot = afterUpload.lastIndexOf(".");
  const format = lastDot !== -1 ? afterUpload.slice(lastDot + 1) : "";
  const publicId = lastDot !== -1 ? afterUpload.slice(0, lastDot) : afterUpload;

  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  });
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

export const allowedCatalogImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxCatalogImageSizeBytes = 5 * 1024 * 1024;

export function validateCatalogImageFile(file: File | null | undefined) {
  if (!file) {
    return "Missing image file.";
  }
  if (!allowedCatalogImageTypes.includes(file.type as (typeof allowedCatalogImageTypes)[number])) {
    return "Only JPEG, PNG, and WebP images are allowed.";
  }
  if (file.size > maxCatalogImageSizeBytes) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

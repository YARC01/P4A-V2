/**
 * Utility for parsing and normalizing Google Drive image sharing links
 * into direct embeddable preview image URLs, as well as handling direct file uploads.
 */

/**
 * Extracts Google Drive File ID from various link formats:
 * - https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing
 * - https://drive.google.com/open?id=1A2B3C4D5E
 * - https://drive.google.com/uc?id=1A2B3C4D5E
 * - https://drive.google.com/uc?export=view&id=1A2B3C4D5E
 * - https://docs.google.com/file/d/1A2B3C4D5E/...
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Pattern 1: /file/d/FILE_ID/
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    return matchFileD[1];
  }

  // Pattern 2: id=FILE_ID
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) {
    return matchIdParam[1];
  }

  // Pattern 3: /d/FILE_ID (lh3 or uc)
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) {
    return matchD[1];
  }

  return null;
}

/**
 * Converts a Google Drive link or raw image URL into a reliable direct image URL
 */
export function normalizeGoogleDriveImageUrl(url: string): {
  isDrive: boolean;
  fileId: string | null;
  displayUrl: string;
} {
  if (!url) {
    return {
      isDrive: false,
      fileId: null,
      displayUrl: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=800&auto=format&fit=crop&q=80',
    };
  }

  const fileId = extractGoogleDriveId(url);
  if (fileId) {
    // Google's direct CDN thumbnail service (very reliable and bypasses hotlinking restrictions)
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    return {
      isDrive: true,
      fileId,
      displayUrl: directUrl,
    };
  }

  return {
    isDrive: false,
    fileId: null,
    displayUrl: url.trim(),
  };
}

/**
 * Convert a File object to base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

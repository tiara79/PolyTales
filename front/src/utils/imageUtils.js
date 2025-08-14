const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:3001/img';

/**
 * 이미지 URL 생성 (fallback 지원)
 */
export function toImageUrl(filename, fallback) {
  if (!filename) return fallback;
  if (filename.startsWith('http') || filename.startsWith('/')) return filename;
  return `${IMAGE_BASE_URL}/${filename}`;
}

/**
 * 프로필 이미지 URL 생성
 */
export function getProfileImageUrl(filename, fallback) {
  if (!filename) return fallback;
  if (filename.startsWith('http')) return filename;
  return `${IMAGE_BASE_URL}/uploads/${filename}`;
}

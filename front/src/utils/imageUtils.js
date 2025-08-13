// utils/imageUtils.js
// 이미지 URL을 올바른 백엔드 URL로 변환하는 유틸리티 함수

export const getImageUrl = (imagePath, defaultImage = null) => {
  // 이미지 경로가 없으면 기본 이미지 반환
  if (!imagePath) return defaultImage;
  
  // 이미 HTTP/HTTPS URL이면 그대로 반환
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 상대 경로면 백엔드 서버 URL 추가
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  return `${baseUrl}${imagePath}`;
};

export const getProfileImageUrl = (profileImg, defaultProfileImage) => {
  return getImageUrl(profileImg, defaultProfileImage);
};

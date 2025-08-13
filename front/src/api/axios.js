import axios from 'axios';

// 환경변수 기반 API 주소 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// 기본 헤더 설정
instance.defaults.headers.common['Accept'] = 'application/json';
instance.defaults.headers.common['Content-Type'] = 'application/json';

// 요청 인터셉터: 토큰 자동 추가
instance.interceptors.request.use(
  (config) => {
    // 카카오 언링크 요청은 Authorization 헤더를 덮어쓰지 않음
    if (config.url && config.url.includes('/auth/kakao/unlink')) {
      // 아무것도 하지 않음 (kakaoUnlink에서 직접 헤더 지정)
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // 불필요한 헤더 제거
    delete config.headers['User-Agent'];
    delete config.headers['Accept-Encoding'];
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 헤더 에러 처리
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 431) {
      console.error('Request Header Fields Too Large');
    }
    return Promise.reject(error);
  }
);

// 프로필 이미지 업로드 API
export const uploadProfileImage = (formData) => {
  return instance.post('/profile/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 30000 // 파일 업로드는 더 긴 타임아웃
  });
};

// 회원 탈퇴 API
export const withdrawUser = () => instance.delete('/profile/withdraw');

// 카카오 계정 언링크(연결해제) API
export const kakaoUnlink = ({ access_token, oauthid }) => {
  return instance.post(
    '/auth/kakao/unlink',
    { oauthid },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
};

export default instance;
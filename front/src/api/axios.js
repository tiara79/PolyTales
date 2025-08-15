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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      console.error('Request Header Fields Too Large - 토큰이나 헤더가 너무 큽니다.');
    }
    return Promise.reject(error);
  }
);

export default instance;
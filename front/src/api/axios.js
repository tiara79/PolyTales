// src/api/axios.js
import axios from "axios";
import { API_URL } from "../config/AppConfig";

const instance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// 기본 헤더
instance.defaults.headers.common["Accept"] = "application/json";
instance.defaults.headers.common["Content-Type"] = "application/json";

// 요청 인터셉터: 토큰 자동 부착
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // 브라우저에서 의미 없고 에러 유발 가능한 헤더 제거
    delete config.headers["User-Agent"];
    delete config.headers["Accept-Encoding"];
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 공통 에러 처리
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 431) {
      console.error("Request Header Fields Too Large - 헤더가 너무 큽니다.");
    }
    return Promise.reject(err);
  }
);

export default instance;
export { API_URL }; // (원하면 화면에 표시/디버그용으로 사용)

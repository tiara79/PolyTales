// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://polytales.azurewebsites.net/api",
  withCredentials: true,
  timeout: 10000,
});

// 기본 헤더
api.defaults.headers.common["Accept"] = "application/json";
api.defaults.headers.common["Content-Type"] = "application/json";

// 요청 인터셉터: 토큰 자동 부착
api.interceptors.request.use(
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
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 431) {
      console.error("Request Header Fields Too Large - 헤더가 너무 큽니다.");
    }
    return Promise.reject(err);
  }
);

export default api;

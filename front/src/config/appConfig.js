// src/config/appConfig.js
// 번들러(Vite/CRA/Webpack) 상관없이 안전하게 API_URL 결정
export const API_URL = (() => {
  // Vite
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // CRA / Webpack DefinePlugin
  if (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // (선택) 전역 주입
  if (typeof window !== "undefined" && window.__API_URL__) {
    return window.__API_URL__;
  }
  // 기본값
  return "http://localhost:3000";
})();

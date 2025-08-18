// src/config/AppConfig.js
// 번들러(Vite/CRA/Webpack) 상관없이 안전하게 API_URL 결정
export const API_URL = (() => {
  // CRA / Webpack DefinePlugin (우선순위 1)
  if (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) {
    console.log("API_URL from process.env:", process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  // Vite
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    console.log("API_URL from import.meta:", import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  // (선택) 전역 주입
  if (typeof window !== "undefined" && window.__API_URL__) {
    console.log("API_URL from window:", window.__API_URL__);
    return window.__API_URL__;
  }
  // Azure 기본값 (localhost 대신 Azure 주소 사용)
  console.log("API_URL using fallback: https://polytales.azurewebsites.net");
  return "https://polytales.azurewebsites.net";
})();

// front/src/context/AuthContext.jsx
// -----------------------------------------------------------------------------
// 인증 컨텍스트
// - user/token을 메모리와 localStorage에 유지
// - login()/logout() 제공
// - token 변경 시 전역 axios 인스턴스(있다면) Authorization 헤더 자동 동기화
//   (window.__AXIOS_INSTANCE__ 에 axios 인스턴스를 할당해두면 사용됨)
// -----------------------------------------------------------------------------
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_USER_KEY = "user";
const STORAGE_TOKEN_KEY = "token";

export const AuthContext = createContext({
  user: null,
  token: null,
  login: (_user, _token) => {},
  logout: () => {},
});

//  Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // 사용자 정보
  const [token, setToken] = useState(null);   // 액세스 토큰

  //  초기화: localStorage에 저장된 세션 복구
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_USER_KEY);
      const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch {
      // 복구 실패 시 무시
    }
  }, []);

  //  로그인: 상태 + localStorage 동기화
  const login = useCallback((userData, accessToken) => {
    try {
      setUser(userData || null);
      setToken(accessToken || null);

      if (userData) localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      else localStorage.removeItem(STORAGE_USER_KEY);

      if (accessToken) localStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
      else localStorage.removeItem(STORAGE_TOKEN_KEY);
    } catch {
      // 저장 실패 시 무시
    }
  }, []);

  //  로그아웃: 상태/스토리지 초기화
  const logout = useCallback(() => {
    try {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    } catch {
      // 삭제 실패 시 무시
    }
  }, []);

  //  axios 전역 인스턴스 동기화(선택)
  // - window.__AXIOS_INSTANCE__ = axios 인스턴스; 로 설정해 두면 자동 적용
  useEffect(() => {
    try {
      const ax = window.__AXIOS_INSTANCE__;
      if (ax && ax.defaults && ax.defaults.headers && ax.defaults.headers.common) {
        if (token) ax.defaults.headers.common.Authorization = `Bearer ${token}`;
        else delete ax.defaults.headers.common.Authorization;
      }
    } catch {
      // 동기화 실패 시 무시
    }
  }, [token]);

  const value = useMemo(() => ({ user, token, login, logout }), [user, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//  훅
export function useAuth() {
  return useContext(AuthContext);
}

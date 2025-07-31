// AuthContext.jsx를 다음과 같이 수정/확인
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 로그인 함수
  const login = (userData, userToken) => {
    console.log("🔄 AuthContext login 호출됨:");
    console.log("- userData:", userData);
    console.log("- userToken:", userToken);
    
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    
    console.log("✅ AuthContext 상태 업데이트 완료");
    console.log("📊 현재 user 상태:", userData);
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 페이지 새로고침 시 토큰 복원
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("🔄 localStorage에서 사용자 정보 복원:", parsedUser);
        
        setToken(savedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ 사용자 정보 파싱 실패:", error);
        logout();
      }
    }
  }, []);

  // 상태 변화 디버깅
  useEffect(() => {
    console.log("🔍 AuthContext 상태 변화:");
    console.log("- user:", user);
    console.log("- isAuthenticated:", isAuthenticated);
    console.log("- nickname:", user?.nickname);
    console.log("- profimg:", user?.profimg);
  }, [user, isAuthenticated]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
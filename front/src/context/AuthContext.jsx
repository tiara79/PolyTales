// AuthContext.jsx를 다음과 같이 수정/확인
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 로그인 함수
  const login = (userData, userToken) => {
    // console.log(" AuthContext login called:");
    // console.log("- userData:", userData);
    // console.log("- userToken:", userToken);
    
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    
    // console.log("AuthContext Status Update Completed");
    // console.log("Current user state:", userData);
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
        // console.log(" Restore user information from local storage", parsedUser);
        
        setToken(savedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // console.error("Failed to parse user information:", error);
        logout();
      }
    }
  }, []);

  // 상태 변화 디버깅
  useEffect(() => {
    // console.log(" AuthContext Status Change:");
    console.log("- user:", user);
    // console.log("- isAuthenticated:", isAuthenticated);
    // console.log("- nickname:", user?.nickname);
    // console.log("- profimg:", user?.profimg);
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
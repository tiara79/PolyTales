import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (userData, token) => {
    const nowDate = new Date();
    const nowDateStr = nowDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const nowDateTimeStr = nowDate.toISOString().replace('T', ' ').slice(0, 19); // YYYY-MM-DD HH:MM:SS

    const termsVersionNum = 1; // 약관 버전 숫자 타입으로 저장

    const updatedUserData = {
      ...userData,
      terms_version: termsVersionNum,
      accepted_terms_version: nowDateStr,
      terms_agreed_at: nowDateTimeStr,
    };
    setUser(updatedUserData);
    setToken(token);
    localStorage.setItem("token", token); 
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    // console.log("Token length:", token?.length);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };


  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const LevelsContext = createContext();

// const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']; 관리 페이지 
export const LevelsProvider = ({ children }) => {
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    axios.get('/stories/levels')
      .then(res => setLevels(res.data.data)) 
      .catch(() => setLevels([]));
  }, []);

  return (
    <LevelsContext.Provider value={levels}>
      {children}
    </LevelsContext.Provider>
  );
};
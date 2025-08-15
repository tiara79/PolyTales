import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const LevelsContext = createContext();

export const LevelsProvider = ({ children }) => {
  const [levels, setLevels] = useState([]); // 하드코딩 제거
  const [levelLabelsKo] = useState({
    A1: '초급 1',
    A2: '초급 2', 
    B1: '중급 1',
    B2: '중급 2',
    C1: '고급 1',
    C2: '고급 2'
  });

  useEffect(() => {
    axios.get('/stories/levels')
      .then(res => {
        console.log('Levels API response:', res.data);
        if (res.data.data && Array.isArray(res.data.data)) {
          setLevels(res.data.data);
        } else if (res.data && Array.isArray(res.data)) {
          // 응답 구조가 다를 경우를 대비
          setLevels(res.data);
        }
      })
      .catch(error => {
        console.error('Failed to fetch levels:', error);
        // DB 연결 실패시에만 기본값 사용
        setLevels(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
      });
  }, []);

  const contextValue = {
    levels,
    levelLabelsKo,
    langLabel: {} // 필요시 추가
  };

  return (
    <LevelsContext.Provider value={contextValue}>
      {children}
    </LevelsContext.Provider>
  );
};
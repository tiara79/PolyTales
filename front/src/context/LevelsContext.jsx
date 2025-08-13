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

  const levelLabelsKo = {
    A1: '초급',
    A2: '초중급',
    B1: '중급',
    B2: '중고급',
    C1: '고급',
    C2: '최고급',
  };

  // nation별 언어 라벨
  const langLabel = {
    ko: '한국어',
    en: '영어',
    fr: '프랑스어',
    ja: '일본어',
    es: '스페인어',
    de: '독일어',
  };

  return (
    <LevelsContext.Provider value={{ levels, levelLabelsKo, langLabel }}>
      {children}
    </LevelsContext.Provider>
  );
};
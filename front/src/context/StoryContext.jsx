// src/context/StoryContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "../api/axios";

export const StoryContext = createContext({
  story: [], // stories → story
  currentStory: null,
  setCurrentStory: () => {},
  loading: false,
});

export const StoryProvider = ({ children }) => {
  const [story, setstory] = useState([]);        // stories → story
  const [currentStory, setCurrentStory] = useState(null);
  const [loading, setLoading] = useState(false);

  // 안전한 응답 파싱 유틸
  const parseList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rows)) return payload.rows;
    return [];
  };

  // 스토리 목록 불러오기
  useEffect(() => {
    const fetchstory = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/story'); // /stories → /story
        setstory(parseList(response.data));
      } catch (error) {
        console.error('story fetch error:', error);
        setstory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchstory();
  }, []);



  return (
    <StoryContext.Provider
      value={{ story, currentStory, setCurrentStory, loading }}
    >
      {children}
    </StoryContext.Provider>
  );
};

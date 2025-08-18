// src/context/StoryContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "../api/axios";

export const StoryContext = createContext({
  stories: [],
  currentStory: null,
  setCurrentStory: () => {},
  loading: false,
});

export const StoryProvider = ({ children }) => {
  const [stories, setStories] = useState([]);        // 스토리 목록
  const [currentStory, setCurrentStory] = useState(null); // 현재 선택된 스토리
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
    const fetchStories = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/stories');
        setStories(parseList(response.data));
      } catch (error) {
        console.error('Stories fetch error:', error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);



  return (
    <StoryContext.Provider
      value={{ stories, currentStory, setCurrentStory, loading }}
    >
      {children}
    </StoryContext.Provider>
  );
};

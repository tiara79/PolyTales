// src/context/StoryContext.jsx
import { createContext, useEffect, useState } from "react";

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

  const API = process.env.REACT_APP_API_URL;

  // 안전한 응답 파싱 유틸
  const parseList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rows)) return payload.rows;
    return [];
  };

  // 스토리 목록 불러오기
  useEffect(() => {
    const ac = new AbortController();
    const { signal } = ac;

    setLoading(true);
    fetch(`${API}/stories`, { signal })
      .then((res) => res.json().catch(() => ({})))
      .then((result) => {
        if (signal.aborted) return;
        setStories(parseList(result));
      })
      .catch(() => {
        if (signal.aborted) return;
        setStories([]);
      })
      .finally(() => {
        if (signal.aborted) return;
        setLoading(false);
      });

    return () => ac.abort();
  }, [API]);



  return (
    <StoryContext.Provider
      value={{ stories, currentStory, setCurrentStory, loading }}
    >
      {children}
    </StoryContext.Provider>
  );
};

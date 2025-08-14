import { createContext, useContext, useMemo, useState } from "react";

export const StoryContext = createContext({
  stories: [], storyTitleMap: {}, setStories: () => {}, setStoryTitleMap: () => {}
});

export function StoryProvider({ children, value }) {
  const [stories, setStories] = useState(value?.stories ?? []);
  const [storyTitleMap, setStoryTitleMap] = useState(value?.storyTitleMap ?? {});
  const ctx = useMemo(() => ({ stories, setStories, storyTitleMap, setStoryTitleMap }), [stories, storyTitleMap]);
  return <StoryContext.Provider value={ctx}>{children}</StoryContext.Provider>;
}

export const useStory = () => useContext(StoryContext);
export default StoryContext;

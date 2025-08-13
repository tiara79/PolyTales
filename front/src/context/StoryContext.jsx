import { createContext, useEffect, useState } from 'react';
import instance from '../api/axios';

export const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
	const [stories, setStories] = useState([]); // 스토리 목록
	const [loading, setLoading] = useState(true); // 로딩 상태

	// 환경별 API base URL 적용
	const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

	// 스토리 목록 불러오기
	useEffect(() => {
		const fetchStories = async () => {
			setLoading(true);
			try {
				const response = await instance.get('/stories');
				if (response.data && response.data.data) {
					// 이미지 경로가 상대경로면 서버 도메인 붙여서 가공
					const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
					const processedStories = response.data.data.map((story) => ({
						...story,
						storycoverpath:
							story.storycoverpath && !/^https?:\/\//.test(story.storycoverpath)
								? `${baseUrl}${story.storycoverpath}`
								: story.storycoverpath,
						thumbnail:
							story.thumbnail && !/^https?:\/\//.test(story.thumbnail)
								? `${baseUrl}${story.thumbnail}`
								: story.thumbnail,
					}));
					setStories(processedStories); // storycoverpath, storylearnimg 등 포함된 전체 정보
				} else {
					setStories([]);
				}
			} catch (error) {
				setStories([]);
			} finally {
				setLoading(false);
			}
		};
		fetchStories();
	}, []);

	// storyid로 타이틀 매핑 객체 생성
	const storyTitleMap = stories.reduce((acc, story) => {
		acc[story.storyid] = story.storytitle;
		return acc;
	}, {});

	// storyid로 이미지 매핑 객체 생성 (cover, learnimg 등)
	const storyImageMap = stories.reduce((acc, story) => {
		acc[story.storyid] = story.thumbnail || story.storycoverpath || '';
		return acc;
	}, {});

	return (
		<StoryContext.Provider value={{ stories, storyTitleMap, storyImageMap, loading }}>
			{children}
		</StoryContext.Provider>
	);
};

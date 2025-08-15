import { createContext, useEffect, useState } from 'react';

export const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
	const [stories, setStories] = useState([]); // 스토리 목록
	const [currentStory, setCurrentStory] = useState(null); // 현재 선택된 스토리
	const [attendance, setAttendance] = useState(0); // 출석/진도 등
	const [loading, setLoading] = useState(false);


	// 환경별 API base URL 적용
	const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

	// 스토리 목록 불러오기
	useEffect(() => {
		setLoading(true);
		fetch(`${API_BASE_URL}/stories`)
			.then(res => res.json())
			.then(result => {
				setStories(result.data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [API_BASE_URL]);

	// 출석 정보 불러오기
	useEffect(() => {
		fetch(`${API_BASE_URL}/users/attendance`)
			.then(res => res.json())
			.then(result => setAttendance(result.data?.days || 0))
			.catch(() => setAttendance(0));
	}, [API_BASE_URL]);

	return (
		<StoryContext.Provider value={{ stories, currentStory, setCurrentStory, attendance, loading }}>
			{children}
		</StoryContext.Provider>
	);
};

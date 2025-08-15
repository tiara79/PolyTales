import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LevelsContext } from '../context/LevelsContext';
import '../style/Home.css';

const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    imageBaseUrl: 'http://localhost:3000'
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://polytales-api.azurewebsites.net',
    imageBaseUrl: process.env.REACT_APP_API_URL || 'https://polytales-api.azurewebsites.net'
  }
};

const currentConfig = config[process.env.NODE_ENV || 'development'];

export default function Home() {
  const [selected, setSelected] = useState('A1');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const levelsContext = useContext(LevelsContext);
  const levels = levelsContext?.levels || [];
  const levelLabelsKo = levelsContext?.levelLabelsKo || {};
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const navigate = useNavigate();

  // Context 디버깅
  console.log('LevelsContext:', levelsContext);
  console.log('Levels:', levels);
  console.log('LevelLabelsKo:', levelLabelsKo);

  // 이미지 URL 생성 함수
  const getImageUrl = (story) => {
    console.log('Processing story:', story.storyid, 'thumbnail:', story.thumbnail);
    
    // blob URL인 경우 그대로 반환
    if (story.thumbnail && story.thumbnail.startsWith('blob:')) {
      return story.thumbnail;
    }
    
    // HTTP URL인 경우 그대로 반환
    if (story.thumbnail && story.thumbnail.startsWith('http')) {
      return story.thumbnail;
    }
    
    // 썸네일이 있는 경우 public/style/img/contents/ 경로로 변환
    if (story.thumbnail) {
      return `/style/img/contents/${story.thumbnail}`;
    }
    
    // 특정 스토리의 fallback 이미지
    if (story.storyid === 1) {
      return '/style/img/contents/lilys_happy_day.jpg';
    }
    
    // 기본 fallback 이미지 - 정확한 경로 사용
    return '/style/img/home/no_image.png';
  };

  // 레벨별 스토리 데이터 가져오기
  const fetchStoriesByLevel = async (level) => {
    setLoading(true);
    try {
      console.log('Fetching stories for level:', level);
      
      // 백엔드 라우터 경로에 맞게 수정: /stories/level/:level
      const response = await fetch(`${currentConfig.apiUrl}/stories/level/${level}`);
      console.log('Response status:', response.status);
      
      if (response.status === 404) {
        // 404인 경우 소문자로 재시도
        const retryResponse = await fetch(`${currentConfig.apiUrl}/stories/level/${level.toLowerCase()}`);
        if (retryResponse.ok) {
          const result = await retryResponse.json();
          console.log('Stories response (retry):', result);
          if (result.data && Array.isArray(result.data)) {
            setStories(result.data);
          } else {
            setStories([]);
          }
        } else {
          console.error('Both attempts failed');
          setStories([]);
        }
      } else if (response.ok) {
        const result = await response.json();
        console.log('Stories response:', result);
        if (result.data && Array.isArray(result.data)) {
          setStories(result.data);
        } else {
          setStories([]);
        }
      } else {
        console.error('Failed to fetch stories:', response.status);
        setStories([]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with selected:', selected);
    if (selected) {
      fetchStoriesByLevel(selected);
    }
  }, [selected]);

  // 초기 데이터 확인
  useEffect(() => {
    console.log('Initial render - levels:', levels, 'selected:', selected);
  }, []);

  // confirm dialog 핸들러
  const handleConfirmYes = () => {
    setShowConfirm(false);
    navigate('/plan');
  };
  const handleConfirmNo = () => {
    setShowConfirm(false);
  };

  return (
    <div className="recommend-section">
      <h2>언어레벨에 따라 언어를 공부해보세요!</h2>
      
      {/* 레벨 선택 버튼 영역 시작 */}
      <div className="level-buttons">
        {levels.length === 0 ? (
          <div>레벨 데이터를 불러오는 중...</div>
        ) : (
          levels.map(level => (
            <button
              key={level}
              onClick={() => {
                console.log('Level button clicked:', level);
                setSelected(level);
              }}
              className={`level-btn ${level} ${selected === level ? `selected ${level}` : ''}`}
            >
              <strong>{level}</strong><br />
              <span>{levelLabelsKo[level] || level}</span>
            </button>
          ))
        )}
      </div>
      {/* 레벨 선택 버튼 영역 끝 */}

      {/* 스토리 이미지 그리드 영역 시작 */}
      <div className="image-grid">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : stories.length === 0 ? (
          <div className="no-stories">이 레벨에 해당하는 스토리가 없습니다.</div>
        ) : (
          stories.map((story) => {
            const imageUrl = getImageUrl(story);
            console.log('Rendering story:', story.storyid, 'with image URL:', imageUrl);
            
            const handleImageClick = () => {
              const openDetailIds = [1, 10, 15, 17, 19, 29, 30, 38];
              
              if (
                (user?.role === 1) ||
                (user?.role === 2 && (user?.status === 1 || user?.status === 2) && openDetailIds.includes(story.storyid)) ||
                (!user && story.storyid === 1)
              ) {
                navigate(`/detail?storyid=${story.storyid}&level=${selected}`); // selected는 이미 대문자
              } else {
                setShowConfirm(true);
              }
            };
            
            return (
              <div key={story.storyid} className="image-box">
                <img
                  src={imageUrl}
                  alt={story.storytitle || 'Story image'}
                  className="story-image" // CSS 클래스 추가
                  onClick={handleImageClick}
                  onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                  onError={(e) => { 
                    console.error('Image load error for story:', story.storyid, 'URL:', imageUrl);
                    
                    // public/style/img 폴더 내 다양한 경로 시도
                    const currentSrc = e.target.src;
                    
                    if (story.thumbnail && !currentSrc.includes('/style/img/contents/')) {
                      // 첫 번째 시도: /style/img/contents/ 폴더
                      e.target.src = `/style/img/contents/${story.thumbnail}`;
                    } else if (story.thumbnail && !currentSrc.includes('/style/img/uploads/')) {
                      // 두 번째 시도: /style/img/uploads/ 폴더
                      e.target.src = `/style/img/uploads/${story.thumbnail}`;
                    } else if (story.thumbnail && !currentSrc.includes('/style/img/a1/')) {
                      // 세 번째 시도: /style/img/a1/ 폴더 (레벨별 폴더)
                      e.target.src = `/style/img/a1/${story.thumbnail}`;
                    } else if (story.storyid === 1 && !currentSrc.includes('lilyshappyday.png')) {
                      // 네 번째 시도: 특별 이미지
                      e.target.src = '/style/img/home/lilyshappyday.png';
                    } else if (!currentSrc.includes('no_image.png')) {
                      // 마지막 시도: 기본 이미지
                      e.target.src = '/style/img/home/no_image.png';
                    }
                  }}
                />
                <p className="image-title">
                  {story.storytitle || `Story ${story.storyid}`}
                </p>
              </div>
            );
          })
        )}
      </div>
      {/* 스토리 이미지 그리드 영역 끝 */}

      {/* 커스텀 confirm dialog */}
      {showConfirm && (
        <div className="custom-confirm-overlay">
          <div className="custom-confirm-dialog">
            <p>유료 서비스 입니다.<br />유료 서비스를 이용 하시겠습니까?</p>
            <div className="custom-confirm-buttons">
              <button onClick={handleConfirmYes}>Yes</button>
              <button onClick={handleConfirmNo}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
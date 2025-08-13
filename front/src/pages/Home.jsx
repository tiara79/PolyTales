import  { useState, useEffect, useContext } from 'react';
// import { Link } from 'react-router-dom';
import { LevelsContext } from '../context/LevelsContext';
import { AuthContext } from '../context/AuthContext';
import Lilyshappyday from '../style/img/home/Lilyshappyday.png';
import noimage from '../style/img/home/no_image.png';
import '../style/Home.css';
import { useNavigate } from 'react-router-dom';

const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    imageBaseUrl: 'http://localhost:3000/img/contents'
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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 레벨별 스토리 데이터 가져오기
  const fetchStoriesByLevel = async (level) => {
    setLoading(true);
    try {
      const response = await fetch(`${currentConfig.apiUrl}/stories/level/${level}`);
      const result = await response.json();
      if (response.ok) setStories(result.data);
      else setStories([]);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoriesByLevel(selected);
  }, [selected]);

  // 회원 또는 관리자 상태/권한 분기
  const isMemberOrAdmin = (user?.role === 2 && (user?.status === 1 || user?.status === 2)) || user?.role === 1;

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
        {(levels || []).map(level => (
          <button
            key={level}
            onClick={() => setSelected(level)}
            className={`level-btn ${level} ${selected === level ? `selected ${level}` : ''}`}
          >
            <strong>{level}</strong><br />
            <span>{levelLabelsKo[level]}</span>
          </button>
        ))}
      </div>
      {/* 레벨 선택 버튼 영역 끝 */}

      {/* 스토리 이미지 그리드 영역 시작 */}
      <div className="image-grid">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          (() => {
            const openDetailIds = [1, 10, 15, 17, 19, 29, 30, 38];
            // 권한별 자물쇠 표시 함수
            const getShowLock = (story) => {
              if (user?.role === 1) return false;
              if (user?.role === 2 && (user?.status === 1 || user?.status === 2)) {
                return !openDetailIds.includes(story.storyid);
              }
              return story.storyid !== 1;
            };
            // 오픈/잠김 분리
            const openStories = stories.filter(story => !getShowLock(story));
            const lockedStories = stories.filter(story => getShowLock(story));
            // 렌더 함수
            const renderStory = (story) => {
              const imageUrl = story.thumbnail ? `${currentConfig.imageBaseUrl}/${story.thumbnail}` : null;
              const fallbackImage = story.storyid === 1 ? Lilyshappyday : noimage;
              const showLock = getShowLock(story);
              const handleImageClick = () => {
                if (
                  (user?.role === 1) ||
                  (user?.role === 2 && (user?.status === 1 || user?.status === 2) && openDetailIds.includes(story.storyid)) ||
                  (!user && story.storyid === 1)
                ) {
                  navigate(`/detail?storyid=${story.storyid}&level=${selected}`);
                } else {
                  setShowConfirm(true);
                }
              };
              return (
                <div key={story.storyid} className="image-box">
                  <img
                    src={imageUrl || fallbackImage}
                    alt={story.storytitle}
                    onClick={handleImageClick}
                    style={{ cursor: 'pointer' }}
                    onError={e => { e.target.src = fallbackImage; }}
                  />
                  {showLock && (
                    <div className="lock-icon">🔒</div>
                  )}
                  <p className="image-title">
                    {story.storytitle}
                  </p>
                </div>
              );
            };
            // 오픈 먼저, 잠김 나중에 출력
            return (
              <>
                {openStories.map(renderStory)}
                {lockedStories.map(renderStory)}
              </>
            );
          })()
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
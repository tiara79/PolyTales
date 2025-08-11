import  { useState, useEffect, useContext } from 'react';
// import { Link } from 'react-router-dom';
import { LevelsContext } from '../context/LevelsContext';
import { AuthContext } from '../context/AuthContext';
import Lilyshappyday from '../style/img/home/Lilyshappyday.png';
import noimage from '../style/img/home/no_image.png';
import '../style/Home.css';
import { toast } from 'react-toastify';

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
const levelLabelsKo = {
  A1: '초급',  A2: '초중급', B1: '중급', B2: '중고급', C1: '고급', C2: '최고급',
};

export default function Home() {
  const [selected, setSelected] = useState('A1');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const levels = useContext(LevelsContext);
  const { user } = useContext(AuthContext);

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
          stories.map(story => {
            const imageUrl = story.thumbnail ? `${currentConfig.imageBaseUrl}/${story.thumbnail}` : null;
            const fallbackImage = story.storyid === 1 ? Lilyshappyday : noimage;
            const handleImageClick = () => {
              if (story.storyid === 1) {
                window.location.href = '/detail';
              } else {
                toast('개발 중 입니다', { position: 'top-right' });
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
                {/* 회원 또는 관리자가 아니면 자물쇠 표시 */}
                {story.storyid !== 1 && !isMemberOrAdmin && (
                  <div className="lock-icon">🔒</div>
                )}
                <p className="image-title">
                {story.storytitle}
              </p>
              </div>
            );
          })
        )}
      </div>
      {/* 스토리 이미지 그리드 영역 끝 */}
    </div>
  );
}
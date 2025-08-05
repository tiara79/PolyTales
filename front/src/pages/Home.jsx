import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style/Home.css';
import Lilyshappyday from '../style/img/home/Lilyshappyday.png';
import sampleImg from '../style/img/home/sample.png';

// 개발환경: http://localhost:3000/img/contents/lilys_happy_day.png
// 배포환경: https://polytales-api.azurewebsites.net/img/contents/lilys_happy_day.png
// .env 환경변수 설정: REACT_APP_API_URL=https://polytales-api.azurewebsites.net
// 환경별 설정 - App Service 정적 파일 서빙 방식
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

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const levelLabelsKo = {
  A1: '초급',
  A2: '초중급',
  B1: '중급',
  B2: '중고급',
  C1: '고급',
  C2: '최고급',
};

export default function Home() {
  const [selected, setSelected] = useState('A1');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 레벨별 스토리 데이터 가져오기
  const fetchStoriesByLevel = async (level) => {
    setLoading(true);
    try {
      const response = await fetch(`${currentConfig.apiUrl}/stories/level/${level}`);
      const result = await response.json();
      
      if (response.ok) {
        setStories(result.data);
      } else {
        console.error('스토리 조회 실패:', result.message);
        setStories([]);
      }
    } catch (error) {
      console.error('스토리 조회 오류:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 A1 레벨 스토리 로드
  useEffect(() => {
    fetchStoriesByLevel('A1');
  }, []);

  const handleSelect = (level) => {
    setSelected(level);
    fetchStoriesByLevel(level);
  };

  return (
    <div className="recommend-section">
      <h2>언어레벨에 따라 언어를 공부해보세요!</h2>

      <div className="level-buttons">
        {levels.map((level) => {
          const isSelected = selected === level;
          return (
            <button
              key={level} 
              onClick={() => handleSelect(level)}
              className={`level-btn ${level} ${isSelected ? `selected ${level}` : ''}`}
            >
              <strong>{level}</strong><br />
              <span>{levelLabelsKo[level]}</span>
            </button>
          );
        })}
      </div>

      <div className="image-grid">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          stories.map((story) => {
            // 스토리별 이미지 매핑 - 각각 다른 이미지 표시
            let imageUrl = null;
            
            // DB thumbnail 값 확인 후 서버 이미지 시도
            if (story.thumbnail) {
              imageUrl = `${currentConfig.imageBaseUrl}/${story.thumbnail}`;
            }
            
            // 스토리별 fallback 이미지 설정
            let fallbackImage;
            if (story.storyid === 1) {
              fallbackImage = Lilyshappyday; // Lily's happy day는 전용 이미지
            } else {
              // 다른 스토리들은 이미지가 없는 경우 sample.png 사용
              fallbackImage = sampleImg;
            }
            
            return (
              <div key={story.storyid} className="image-box">
                {story.storyid === 1 ? (
                  // Lily's happy day - 클릭 가능
                  <Link to="/detail">
                    <img 
                      src={imageUrl || fallbackImage} 
                      alt={story.storytitle}
                      onError={(e) => {
                        e.target.src = fallbackImage;
                      }}
                    />
                  </Link>
                ) : (
                  // 다른 스토리들 - 잠금 상태
                  <div className="locked-image">
                    <img 
                      src={imageUrl || fallbackImage} // 서버 이미지 또는 스토리별 fallback 이미지
                      alt={story.storytitle}
                      onError={(e) => {
                        e.target.src = fallbackImage;
                      }}
                    />
                    <div className="lock-icon">🔒</div>
                    <div className="lock-tooltip">해당 콘텐츠는 유료입니다</div>
                  </div>
                )}
                <p className="image-title">{story.storytitle}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

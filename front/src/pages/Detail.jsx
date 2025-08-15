import {useNavigate, useSearchParams} from 'react-router-dom';
import React, { useState ,useEffect, useContext} from 'react';
import { BookmarkContext } from '../context/BookmarkContext';

import '../style/Detail.css';

export default function Detail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // story 상태 관리
  const [story, setStory] = useState(null);

  const goBack = () => navigate('/'); // back 버튼 -> 홈 이동

  const handleReadClick = () => {
    navigate('/learn'); //  "학습하기"
  };
  
  const { addBookmark, removeBookmark, bookmarks } = useContext(BookmarkContext);
  const isBookmarked = story && bookmarks.some(b => b.storyid === story.storyid);
  const toggleBookmark = () => {
    if (!story) return;
    if (isBookmarked) removeBookmark(story.storyid);
    else addBookmark(story);
  } 

  // story 데이터 fetch 및 디버깅
  useEffect(() => {
    // URL 파라미터에서 storyid와 level 가져오기
    const storyid = searchParams.get('storyid') || 1; 
    const level = searchParams.get('level') || 'a1'; // 소문자 그대로 사용
    
    fetch(`http://localhost:3000/stories/${level}/detail/${storyid}`)
      .then(res => res.json())
      .then(result => {
        console.log('API 응답:', result);
        setStory(result.data);
      })
      .catch(err => {
        console.error('API 에러:', err);
        setStory(null);
      });
  }, [searchParams]);

  // story가 null이면 로딩 표시
  if (!story) {
    return <div className="detail-container"><div>로딩 중...</div></div>;
  }

  return (
    <div className="detail-container">
      <div className="back-button-wrapper">
        <button className="back-button" onClick={goBack}>🔙</button>
      </div>
      {/* 왼쪽 영역 */}
      <div className="detail-wrapper">
        <div className="detail-image">
          <img  src="/style/img/detail/lilys_happy_day.jpg" alt={story.storytitle} />
        </div>
        {/* 오른쪽 영역 */}
        <div className="detail-text">
          <div className="detail-title-row">
            {/* 제목 */}
              <h2 className="detail-title">{story.storytitle}
            {story && (
              <img src={isBookmarked ? "/style/img/detail/next_btn.png" : "/style/img/detail/pre_btn.png"}
                alt="bookmark"  className="bookmark-icon"  onClick={toggleBookmark}/>
            )}
            </h2>
          </div>

          <div className="detail-tags">
            {/* 레벨, 한글 레벨, 주제 태그 */}
            <span className={`tag tag-${story.langlevel?.toLowerCase()}`}>{story.langlevel}</span>
            <span className={`tag tag-${story.langlevel?.toLowerCase()}`}>{story.langlevelko}</span>
            <span className="tag tag-daily">{story.topic}</span>
          </div>

          <div className="detail-desc">
            <h4>작품 소개</h4>
            <p>
              {story.description && story.description.split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </div>

          <button className="read-button" onClick={handleReadClick}>읽기</button>
        </div>
      </div>
    </div>
  );
}
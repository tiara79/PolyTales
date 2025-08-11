import {useNavigate} from 'react-router-dom';
import React, { useState ,useEffect, useContext} from 'react';
import { BookmarkContext } from '../context/BookmarkContext';

import '../style/Detail.css';
import lilyMain from '../style/img/detail/lilyMain.png';
import bookmarkPre from '../style/img/detail/bookmarkPre.png';
import bookmarkNext from '../style/img/detail/bookmarkNext.png';

export default function Detail() {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

  // story 상태 관리
  const [story, setStory] = useState(null);

  const goBack = () => navigate('/'); // back 버튼 -> 홈 이동

  const handleReadClick = () => {
    navigate('/learn'); //  "학습하기"
  };
  // const toggleBookmark = () => setBookmarked(prev => !prev);
  const { addBookmark, removeBookmark, bookmarks } = useContext(BookmarkContext);
  const isBookmarked = story && bookmarks.some(b => b.storyid === story.storyid);
  const toggleBookmark = () => {
    if (!story) return;
    if (isBookmarked) removeBookmark(story.storyid);
    else addBookmark(story);
  } 

  // story 데이터 fetch 및 디버깅
  useEffect(() => {
    const storyid = 1; 
    const level = 'A1'; 
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
  }, []);

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
          <img src={lilyMain} alt="Lily's Happy Day" />
        </div>
        {/* 오른쪽 영역 */}
        <div className="detail-text">
          <div className="detail-title-row">
            {/* 제목 :Lily's happy day */}
              <h2 className="detail-title">{story.storytitle}
            {story && (
              <img src={isBookmarked ? bookmarkNext : bookmarkPre}
                alt="bookmark"  className="bookmark-icon"  onClick={toggleBookmark}/>
            )}
            </h2>
          </div>

          <div className="detail-tags">
            {/* 레벨, 한글 레벨, 주제 태그 */}
            <span className={`tag tag-${story.langlevel.toLowerCase()}`}>{story.langlevel}</span>
            <span className="tag tag-daily">{story.langlevelko}</span>
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

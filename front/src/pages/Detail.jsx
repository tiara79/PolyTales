import {useNavigate, useLocation} from 'react-router-dom';
import React, { useState ,useEffect, useContext} from 'react';
import { BookmarkContext } from '../context/BookmarkContext';

import lilys_happy_day from '../style/img/detail/lilys_happy_day.jpg';
import fantasy_destination from '../style/img/detail/fantasy_destination.jpg';
import five_glassballs from '../style/img/detail/five_glassballs.jpg';
import girls_girls from '../style/img/detail/girls_girls.jpg';
import happy_popttas_adventure from '../style/img/detail/happy_popttas_adventure.jpg';
import jack_and_the_beanstalk from '../style/img/detail/jack_and_the_beanstalk.jpg';
import red_hair_anny from '../style/img/detail/red_hair_anny.jpg';
import on_safari from '../style/img/detail/on_safari.jpg';
import noimage from '../style/img/home/no_image.png';
import bookmarkPre from '../style/img/detail/button/bookmarkPre.png';
import bookmarkNext from '../style/img/detail/button/bookmarkNext.png';

import '../style/Detail.css';

export default function Detail() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const storyid = Number(params.get('storyid'));
  const level = params.get('level');

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
  }, [level, storyid]);

  // story가 null이면 로딩 표시
  if (!story) {
    return <div className="detail-container"><div>로딩 중...</div></div>;
  }

  // storyid별 이미지 매핑
  const storyImages = {
    1: lilys_happy_day,
    10: jack_and_the_beanstalk,
    15: red_hair_anny,
    17: happy_popttas_adventure,
    19: five_glassballs,
    29: fantasy_destination,
    30: girls_girls,
    38: on_safari,
  };
  const storyImage = storyImages[storyid] || noimage;

  return (
    <div className="detail-container">
      <div className="back-button-wrapper">
        <button className="back-button" onClick={goBack}>🔙</button>
      </div>
      {/* 왼쪽 영역 */}
      <div className="detail-wrapper">
        <div className="detail-image">
          <img src={storyImage} alt={story.storytitle} />
  
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

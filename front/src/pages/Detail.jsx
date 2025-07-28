import {useNavigate} from 'react-router-dom';
import { useState } from 'react';
import '../style/Detail.css';
import lilyMain from '../style/img/detail/lilyMain.png';
import bookmarkPre from '../style/img/detail/bookmarkPre.png';
import bookmarkNext from '../style/img/detail/bookmarkNext.png';
import React from 'react';


export default function Detail() {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

  const toggleBookmark = () => setBookmarked(prev => !prev);
  const goBack = () => navigate('/'); // back 버튼 -> 홈 이동

  const handleReadClick = () => {
    navigate('/learn'); //  "학습하기"
  };

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
            <h2 className="detail-title">릴리의 행복한 하루 
            <img src={bookmarked ? bookmarkNext : bookmarkPre}
              alt="bookmark"  className="bookmark-icon"  onClick={toggleBookmark}/>
            </h2>
          </div>

          <div className="detail-tags">
            <span className="tag tag-a1">A1</span>
            <span className="tag tag-daily">일상</span>
          </div>

          <div className="detail-desc">
            <h4>작품 소개</h4>
            <p>
              릴리와 함께 아침을 맞이하고, 작지만 특별한 하루를 만나보세요!<br />
              작은 소녀의 행복한 하루를 따라가는 사랑스러운 이야기
            </p>
            <p>
              — 이제 막 읽기를 시작하는 아이들에게 딱 맞는 동화입니다.<br />
              햇살 가득한 아침부터 포근한 잠자리까지, 릴리의 발자취는 하루 속으로 떠나보세요!
            </p>
          </div>

          <button className="read-button" onClick={handleReadClick}>읽기</button>
        </div>
      </div>
    </div>
  );
}

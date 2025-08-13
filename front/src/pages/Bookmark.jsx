import React, { useState, useContext } from 'react';
import { BookmarkContext } from '../context/BookmarkContext';
import { LevelsContext } from '../context/LevelsContext';
import '../style/Bookmark.css';
import Lilyshappyday from '../style/img/home/Lilyshappyday.png';
import nobookmark from '../style/img/mypage/nobookmark.png';

export default function Bookmark() {
  const { bookmarks } = useContext(BookmarkContext);
  const levelsContext = useContext(LevelsContext);
  const levels = levelsContext?.levels || [];
  const levelLabelsKo = levelsContext?.levelLabelsKo || {};

  const [selected, setSelected] = useState(levels[0] || 'A1');

  // 디버깅: 북마크 데이터 확인
  console.log('북마크 데이터:', bookmarks);

  // langlevel이 없는 경우 전체 북마크 표시
  const hasLangLevel = bookmarks.some(book => book.langlevel);
  const filteredBookmarks = hasLangLevel
    ? bookmarks.filter(book => book.langlevel === selected)
    : bookmarks;

  // myNotes와 동일한 back 버튼 핸들러
  const goBack = () => window.history.length > 1 ? window.history.back() : null;

  return (
    <div className="bookmark-container">
      <div className="mynotes-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={goBack}>
            🔙
          </button>
          <h1 className="page-title">내가 찜한 책들</h1>
        </div>
        <div className="level-buttons">
          {levels.map(level => (
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
        <div className="image-grid">
          {filteredBookmarks.length === 0 ? (
            <div className="image-box">
              <img src={nobookmark} alt="" className="empty-img" />
            </div>
          ) : (
            filteredBookmarks.map(book => {
              const imageBaseUrl = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:3000/img/contents';
              const imageUrl = book.thumbnail ? `${imageBaseUrl}/${book.thumbnail}` : Lilyshappyday;
              return (
                <div key={book.storyid} className="image-box">
                  <img
                    src={imageUrl}
                    alt={book.storytitle}
                    onError={e => { e.target.src = nobookmark; }}
                  />
                  <p className="image-title">{book.storytitle}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
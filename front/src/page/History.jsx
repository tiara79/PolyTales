import { useContext, useState } from 'react';
import { BookmarkContext } from "../context/BookmarkContext";
import { LevelsContext } from '../context/LevelsContext';
import '../style/History.css';

export default function History() {
  const { bookmarks } = useContext(BookmarkContext);
  const levelsContext = useContext(LevelsContext);
  const levels = levelsContext?.levels || [];
  const levelLabelsKo = levelsContext?.levelLabelsKo || {};
  
  const [selected, setSelected] = useState(levels[0] || 'A1');
   // myNotes와 동일한 back 버튼 핸들러
  const goBack = () => window.history.length > 1 ? window.history.back() : null;


  return (
    <div className="history-container">
      <div className="mynotes-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={goBack}>
            🔙
          </button>
           <h1 className='page-title'>내가 읽은 책들</h1>
        </div>

        {/*  level buttons 영역 */}
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
          {bookmarks.length === 0 ? (
            <div className="loading">찜한 책이 없습니다.</div>
          ) : (
            bookmarks.map((book) => {
              const imageBaseUrl = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:3000/img/contents';
              const imageUrl = book.thumbnail ? `${imageBaseUrl}/${book.thumbnail}` : '/img/home/no_image.png';
              return (
                <div key={book.storyid} className="image-box">
                  <img
                    src={imageUrl}
                    alt={book.storytitle}
                    onError={e => { e.target.src = '/img/home/no_image.png'; }}
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
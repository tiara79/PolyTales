import React, { useContext } from 'react';
import { BookmarkContext } from '../context/BookmarkContext';
import '../style/Home.css';
import Lilyshappyday from '../style/img/home/Lilyshappyday.png';
import noimage from '../style/img/home/no_image.png';

export default function History() {
  const { bookmarks } = useContext(BookmarkContext);

  return (
    <div className="recommend-section">
      <h2>내가 찜한 책들</h2>
      <div className="image-grid">
        {bookmarks.length === 0 ? (
          <div className="loading">찜한 책이 없습니다.</div>
        ) : (
          bookmarks.map((book) => {
            const imageBaseUrl = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:3000/img/contents';
            const imageUrl = book.thumbnail ? `${imageBaseUrl}/${book.thumbnail}` : Lilyshappyday;
            return (
              <div key={book.storyid} className="image-box">
                <img
                  src={imageUrl}
                  alt={book.storytitle}
                  onError={e => { e.target.src = noimage; }}
                />
                <p className="image-title">{book.storytitle}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style/home.css';
import Lilyshappyday from '../style/img/home/Lilyshappyday.png';
import sampleImg from '../style/img/home/sample.png';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const levelLabelsKo = {
  A1: '초급',
  A2: '초중급',
  B1: '중급',
  B2: '중고급',
  C1: '고급',
  C2: '최고급',
};

const imageData = [
  { id: 1, title: "Lily's happy day", level: 'A1', available: true },
  { id: 2, title: 'Red', level: 'A1', available: false },
  { id: 3, title: 'Diary', level: 'A1', available: false },
  { id: 4, title: 'Friendship', level: 'A1', available: false },
  { id: 5, title: 'Prince', level: 'A1', available: false },
  { id: 6, title: 'Fighters', level: 'A1', available: false },
  { id: 7, title: 'Pizza', level: 'A1', available: false },
  { id: 8, title: 'Museum', level: 'A1', available: false },
  { id: 9, title: 'Library', level: 'A1', available: false },
  { id: 10, title: 'Ocean', level: 'A1', available: false },
  { id: 11, title: 'Dream', level: 'A1', available: false },
  { id: 12, title: 'Galaxy', level: 'A1', available: false },
  { id: 11, title: 'Dream', level: 'C2', available: false },
  { id: 12, title: 'Galaxy', level: 'C2', available: false },
];

export default function Home() {
  const [selected, setSelected] = useState('A1');

  const handleSelect = (level) => {
    setSelected(prev => (prev === level ? null : level));
  };
   // 선택된 level에 따라 이미지 필터링
  const filteredImages = selected
    ? imageData.filter(item => item.level === selected)  : [];

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
        {filteredImages.map(({ id, title, available }) => (
          <div key={id} className="image-box">
            {available ? (
              <Link to="/detail">
                <img src={Lilyshappyday} alt={title} />
              </Link>
            ) : (
              <div className="locked-image">
                <img src={sampleImg} alt={title} />
                <div className="lock-icon">🔒</div>
                <div className="lock-tooltip">해당 콘텐츠는 유료입니다</div>
              </div>
            )}
            <p className="image-title">{title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

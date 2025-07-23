import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/home.css';
import Lilyshappyday from '../style/img/home/Lilyshappyday.png';

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
  { id: 1, title: "Lily's happy day", level: 'A1' },
  { id: 2, title: 'Red', level: 'A1' },
  { id: 3, title: 'Diary', level: 'A2' },
  { id: 4, title: 'Friendship', level: 'A2' },
  { id: 5, title: 'Prince', level: 'B1' },
  { id: 6, title: 'Fighters', level: 'B1' },
  { id: 7, title: 'Pizza', level: 'B2' },
  { id: 8, title: 'Museum', level: 'B2' },
  { id: 9, title: 'Library', level: 'C1' },
  { id: 10, title: 'Ocean', level: 'C1' },
  { id: 11, title: 'Dream', level: 'C2' },
  { id: 12, title: 'Galaxy', level: 'C2' },
];

export default function Home() {
  const [selected, setSelected] = useState(null);

  const handleSelect = (level) => {
    setSelected(prev => (prev === level ? null : level));
  };

  const filteredImages = selected
    ? imageData.filter(item => item.level === selected)
    : imageData;

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
              className={`level-btn ${level} ${isSelected ? 'selected' : ''}`}
            >
              <strong>{level}</strong><br />
              <span>{levelLabelsKo[level]}</span>
            </button>
          );
        })}
      </div>

      <div className="image-grid">
        {filteredImages.map(({ id, title }) => (
          <div key={id} className="image-box">
            <img src={Lilyshappyday} alt={title} />
            <p className="image-title">{title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

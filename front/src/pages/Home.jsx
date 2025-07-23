
import '../style/home.css';
import sample from '../style/img/sample.png';
import { useState } from 'react';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const levelColors = {
  A1: '#FFB7B7',
  A2: '#FEE8D2',
  B1: '#FFF5BA',
  B2: '#DAF2CB',
  C1: '#D3F7FF',
  C2: '#E7CBF2'
};

// 이미지 12개 더미 데이터 (각 이미지에 level 포함)
const imageData = [
  { id: 1, title: 'Lily', level: 'A1' },
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

  const filteredImages = selected
    ? imageData.filter(item => item.level === selected)
    : imageData;

  return (
    <div className="recommend-section">
      <h2>언어레벨에 따라 언어를 공부해보세요!</h2>
      <div className="level-buttons">
        {levels.map(level => (
          <button
            key={level}
            style={{ backgroundColor: levelColors[level] }}
            className={`level-btn ${selected === level ? 'selected ' + level : ''}`}
            onClick={() => setSelected(level === selected ? null : level)}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="image-grid">
        {filteredImages.map(item => (
          <div key={item.id} className="image-box">
            <img src={sample} alt={item.title} />
            <p className="image-title">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

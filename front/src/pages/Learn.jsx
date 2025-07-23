// src/pages/Learn.jsx
import React from 'react';
import '../style/learn.css';
import learn from '../style/img/learn/learn.png';
import noimg from '../style/img/learn/no-image.png';

export default function Learn() {
  return (
    <div className="learn-wrapper">
      <header className="learn-header">
        <span className="read-start">처음부터 읽기</span>
        <h2 className="story-title">Lily’s happy day</h2>
      </header>

      <main className="learn-main">
        <section className="image-box">
          <img src={learn} alt="Lily smiling in bed" className="story-img" />
          <p className="sentence-text">Lily is a little girl.</p>
          <div className="control-btns">
            <button className="btn">이전문장</button>
            <button className="btn pause">⏸</button>
            <button className="btn">다음문장</button>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: '70%' }}></div>
          </div>
        </section>

        <aside className="learn-side">
          <div className="lang-select">
            <label><input type="radio" name="lang" /> 프랑스어</label>
            <label><input type="radio" name="lang" /> 스페인어</label>
            <label><input type="radio" name="lang" /> 독일어</label>
            <label><input type="radio" name="lang" /> 일본어</label>
            <label><input type="radio" name="lang" /> 영어</label>
          </div>

          <div className="memo-box">
            <div className="memo-head">
              <strong>메모</strong>
              <button className="plus">＋</button>
            </div>
            <input type="text" className="memo-input" placeholder="Title :" />
            <div className="memo-placeholder">배운 내용을 메모해 보세요!</div>
          </div>

          <div className="tutor-box">
            <div className="tutor-header">
              <span className="dot"></span>
              <span className="tutor-name">
                AI tutor Pola <img src={noimg} alt="pola" className="tutor-icon" />
              </span>
            </div>
            <div className="chat-placeholder">궁금한 내용을 질문해 주세요</div>
            <button className="chat-send">보내기</button>
          </div>
        </aside>
      </main>

      <footer className="learn-footer">
        <div className="bottom-info">
          <div className="grammar">
            <h4>문법</h4>
            <p>주어 + be동사 : ~이다</p>
          </div>
          <div className="vocab">
            <h4>단어</h4>
            <p>Lily : 주인공 이름<br />little (형) 작은<br />girl (명) 소녀</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

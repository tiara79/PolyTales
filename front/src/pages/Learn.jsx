// Learn.jsx
import { useRef } from 'react';
import learn from '../style/img/learn/learn.png';
import memoPen from '../style/img/learn/memoPen.png';
import pola from '../style/img/learn/pola.png';
import '../style/learn.css';

export default function Learn() {
  const memoRef = useRef(null);

  const focusMemo = () => {
    if (memoRef.current) {
      memoRef.current.focus();
    }
  };

  return (
    <div className="parent">
      <div className="div1">
        <span className="read-start">처음부터 읽기</span>
      </div>

      <div className="div2">
        <h2 className="story-title">Lily’s happy day</h2>
      </div>

      <div className="div3 image-box">
        <img src={learn} alt="Lily smiling in bed" className="story-img" />
        <p className="sentence-text">Lily is a little girl.</p>
        <div className="control-btns">
          <button className="btn no-bg no-border">이전문장</button>
          <button className="btn pause">⏸</button>
          <button className="btn no-bg no-border">다음문장</button>
        </div>
        <div className="progress-bar">
          <div className="progress" style={{ width: '70%' }}></div>
        </div>
      </div>

  
        <div className="div4 grammar">
          <h4>문법</h4>
          <p>주어 + be동사 : ~이다</p>
        </div>

          <div className="div6 voca">
            <h4>단어</h4>
            <p>
              Lily : 주인공 이름<br />
              little (형) 작은<br />
              girl (명) 소녀
            </p>
        </div>


      <div className="div5 lang-select">
        <label><input type="radio" name="option" /> 프랑스어</label>
        <label><input type="radio" name="option" /> 스페인어</label>
        <label><input type="radio" name="option" /> 영어</label>
        <label><input type="radio" name="option" /> 일본어</label>
        <label><input type="radio" name="option" /> 중국어</label>
        <label><input type="radio" name="option" /> 한국어</label>
      </div>


      <div className="div7 memo-box">
        <div className="memo-head">
          <strong>메모</strong>
          <button className="save-memo">＋</button>
        </div>
        <div className="memo-title">
          <label htmlFor="memoTitle" className="underline-label">Title :</label>
          <input id="memoTitle" type="text" className="memo-input underline" />
        </div>
        <img src={memoPen} alt="memo pen" className="memo-placeholder-img" onClick={focusMemo} />
        <textarea
          className="memo-content"
          placeholder=""
          ref={memoRef}
        ></textarea>
      </div>

    <div className="div8">
        <div className="tutor-info-text">채팅 내역은 저장되지 않습니다.</div>
      <div className="chat-header">
        <div className="pola-badge">
          <span className="tutor-label">AI tutor Pola</span>
          <img src={pola} alt="pola" className="tutor-icon" />
        </div>
      </div>

      <div className="chat-messages">
        <div className="message user">comes up이란 뜻이 뭐야?</div>
        <div className="message tutor">"comes up"은 발생하다라는 뜻이에요</div>
      </div>

    <div className="chat-input-box">
      <input type="text" className="chat-input" placeholder="궁금한 내용을 질문해 주세요" />
      <button className="chat-send">📨</button>
    </div>
  </div>

    </div>
  );
}

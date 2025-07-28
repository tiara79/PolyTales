import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import close from '../style/img/learn/button/close.png';
import pause from '../style/img/learn/button/pause.png';
import send from '../style/img/learn/button/send.png';
import learn from '../style/img/learn/learn.png';
import pola from '../style/img/learn/pola.png';

import '../style/learn.css';
import '../style/chat.css';

function Learn() {
  const navigate = useNavigate();
  const noteTitleRef = useRef(null);
  const noteContentRef = useRef(null);

  const handleCloseClick = () => {
    navigate('/detail');
  };

  const handleSaveNote = async () => {
    const title = noteTitleRef.current?.value.trim();
    const content = noteContentRef.current?.value.trim();

    if (!title || !content) {
      alert('제목과 내용을 모두 입력하세요.');
      return;
    }

    const noteData = {
      userId: 4,
      storyId: 1,
      title,
      content
    };

    try {
      const response = await fetch('http://localhost:3000/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) throw new Error('노트 저장 실패');

      const result = await response.json();
      console.log('노트 저장됨:', result);

      // 입력 초기화
      if (noteTitleRef.current) noteTitleRef.current.value = '';
      if (noteContentRef.current) noteContentRef.current.value = '';
    } catch (err) {
      console.error('노트 저장 중 오류:', err);
    }
  };

  return (
    <div className="parent">
      <div className="div1">
        <span className="read-start">처음부터 읽기</span>
      </div>

      <div className="div2">
        <h2 className="story-title">Lily's happy day</h2>
        <button className="close-button" onClick={handleCloseClick}>
          <img src={close} alt="close" />
        </button>
      </div>

      <div className="div3 image-box">
        <img src={learn} alt="Lily smiling in bed" className="story-img" />
        <p className="sentence-text">Lily is a little girl.</p>
        <div className="control-btns">
          <button className="btn no-bg no-border Text">이전문장</button>
          <button className="btn pause">
            <img src={pause} alt="pause" />
          </button>
          <button className="btn no-bg no-border Text">다음문장</button>
        </div>
        <div className="progress-bar">
          <div className="progress" style={{ width: '70%' }}></div>
        </div>
      </div>

      <div className="div4 grammar">
        <h4>문법</h4>
        <p>주어 + be동사 : ~이다</p>
      </div>

      <div className="div5 voca">
        <h4>단어</h4>
        <p>
          Lily : 주인공 이름<br />
          little (형) 작은<br />
          girl (명) 소녀
        </p>
      </div>

      <div className="div6 lang-select">
        {['한국어', '프랑스어', '일본어', '영어', '스페인어', '독일어'].map((lang, idx) => (
          <label key={idx}>
            <input 
              type="radio" 
              name="option" 
              defaultChecked={idx === 0} 
            /> 
            {lang}
          </label>
        ))}
      </div>

      <div className="div7 note-box">
        <div className="note-head">
          <strong>Note</strong>
          <button className="save-note" onClick={handleSaveNote}>
            ＋
          </button>
        </div>
        <div className="note-title">
          <label htmlFor="noteTitle" className="underline-note">
            Title :
          </label>
          <input 
            id="noteTitle" 
            ref={noteTitleRef} 
            type="text" 
            className="note-input underline" 
          />
        </div>
        <textarea
          className="note-content"
          placeholder=""
          ref={noteContentRef}
          defaultValue=""
        />
      </div>

      <div className="div8">
        <div className="tutor-info">채팅 내역은 저장되지 않습니다.</div>
        <div className="chat-header">
          <div className="pola-badge">
            <span className="tutor-ai">AI tutor Pola</span>
            <img src={pola} alt="pola" className="tutor-icon" />
          </div>
        </div>

        <div className="chat-messages">
          <div className="message user">comes up이란 뜻이 뭐야?</div>
          <div className="message tutor">"comes up"은 발생하다라는 뜻이에요</div>
        </div>

        <div className="chat-input-box">
          <textarea 
            className="chat-input" 
            placeholder="comes up 예제 추가해 주세요."
            defaultValue=""
          />
          <button className="chat-send">
            <img src={send} alt="send button" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Learn;
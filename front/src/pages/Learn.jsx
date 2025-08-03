import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// toast (alert 대체용)
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import close from '../style/img/learn/button/close.png';
import pause from '../style/img/learn/button/pause.png';
import send from '../style/img/learn/button/send.png';
import pola from '../style/img/learn/pola.png';

import '../style/storylearn.css';
import '../style/Learn.css';
import '../style/note.css';
import '../style/Chat.css';


function Learn() {
  const navigate = useNavigate();
  const noteTitleRef = useRef(null);
  const noteContentRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [caption, setCaption] = useState('');
  const [lang, setLang] = useState('ko');
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [languageData, setLanguageData] = useState([]);


  const goPrev = () => setPageNum(p => Math.max(p - 1, 1));
  const goNext = () => setPageNum(prev => Math.min(prev + 1, pages.length));

  const langLabel = {ko: '한국어', fr: '프랑스어',ja: '일본어', en: '영어', es: '스페인어', de: '독일어',};

  // 데이터 로딩을 useEffect로 이동
  useEffect(() => {
    fetch(`http://localhost:3000/learn/1?lang=${lang}`)
      .then(res => res.json())
      .then(result => {
        setPages(result.pages);
        setLanguageData(result.language);
      })
      .catch(error => {
        console.error('데이터 로딩 오류:', error);
      });
  }, [lang]); // lang이 변경될 때마다 실행

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.onended = () => setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (pages.length === 0) return;
    const current = pages[pageNum - 1];
    if (!current || !current.caption) return;

    setCaption(current.caption);
  }, [pageNum, pages]);

  useEffect(() => {
  if (pages.length === 0) return;

  const current = pages[pageNum - 1];
  if (!current || !current.caption) return;

  // \n 처리
  const cleanCaption = current.caption.replace(/\\n/g, '\n');
  setCaption(cleanCaption);
  }, [pageNum, pages]);


  // 자막 줄바꿈 포맷 함수 
  const formatCaption = text => {
    return text
      .split('\n')
      .filter(Boolean)
      .map((line, i) => <p key={i}>{line.trim()}</p>);
  };

  const handleCloseClick = () => navigate('/detail');

  // 노트 저장 함수
    const handleSaveNote = async () => {
      const titleEl = noteTitleRef.current;
      const contentEl = noteContentRef.current;
      const title = titleEl?.value.trim();
      const content = contentEl?.value.trim();

      if (!title || !content) {
        toast.warn('제목과 내용을 모두 입력하세요.');
        return;
      }

      const noteData = {
        userid: 2, // 실제 로그인 상태면 여기 값을 useContext 또는 props 등에서 받아와야 함
        storyid: 1,
        title,
        content
      };

      try {
        const response = await fetch('http://localhost:3000/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData)
        });

        if (!response.ok) {
          throw new Error(`노트 저장 실패 (status ${response.status})`);
        }

        const result = await response.json();
        console.log('노트 저장됨:', result);
        toast.success('노트가 저장되었습니다!');

        // 입력 필드 초기화
        if (titleEl) titleEl.value = '';
        if (contentEl) contentEl.value = '';

      } catch (error) {
        console.error('노트 저장 중 오류:', error.message);
        toast.error('노트 저장에 실패했습니다.');
      }
    };


  return (
    <div className="parent">
      <div className="div1"><span className="read-start">처음부터 읽기</span></div>
      <div className="div2">
        <h2 className="story-title">Lily's happy day</h2>
        <button className="close-button" onClick={handleCloseClick}><img src={close} alt="close" /></button>
      </div>

      {/* 이미지 및 자막 영역 */}
      <div className="div3">
        <div className="story-image-container">
          {pages.length > 0 && (<>
            <img src={pages[pageNum - 1]?.imagepath} alt={`Page ${pageNum}`} className="story-img" />
            <div className="caption-text">{formatCaption(caption)}</div>
            <div className="caption-box">
              <div className="control-btns">
                <button onClick={goPrev} disabled={pageNum === 1} className="btn Text">
                  <span className="icon" />
                  <span>이전 문장</span>
                </button>
                <button onClick={togglePlay} className="btn pause">
                  <img src={isPlaying ? pause : require('../style/img/learn/button/play.png')} alt="play/pause" />
                </button>
                <button onClick={goNext} disabled={pageNum === pages.length} className="btn Text">
                  <span className="icon" />
                  <span>다음 문장</span>
                </button>
              </div>
            </div>
            <div className="progress-bar"><div className="progress" style={{ width: `${(pageNum / pages.length) * 100}%` }} /></div>
            {pages[pageNum - 1]?.audiopath && <audio ref={audioRef} src={pages[pageNum - 1].audiopath} />}
          </>)}
        </div>
      </div>

      {/* 문법 영역 */}
      <div className="div4 grammar">
        <h4>문법</h4>
        <p>{languageData[0]?.grammar || '로딩 중...'}</p>
      </div>

      <div className="div5 voca">
        <h4>단어</h4>
        <p>
          {languageData[0] ? (
            <>
              {languageData[0].word} ({languageData[0].partspeech}) - {languageData[0].mean}<br />
              예문: {languageData[0].vocasentence}
            </>
          ) : (
            '로딩 중...'
          )}
        </p>
      </div>

      {/* 언어 선택 영역 */}
      <div className="div6 lang-select">
        {Object.entries(langLabel).map(([code, label]) => (
          <label key={code}>
            <input
              type="radio"
              name="option"
              value={code}
              checked={lang === code}
              onChange={() => setLang(code)}
            />
            {label}
          </label>
        ))}
      </div>

      {/* 노트 영역 */}
      <div className="div7 note-box">
        <div className="note-head">
          <strong>Note</strong>
          <button className="save-note" onClick={handleSaveNote}>＋</button>
        </div>
        <div className="note-title">
          <label htmlFor="noteTitle" className="underline-note">Title :</label>
          <input id="noteTitle" ref={noteTitleRef} type="text" className="note-input underline" />
        </div>
        <textarea className="note-content" placeholder="" ref={noteContentRef} defaultValue="" />
      </div>

      {/* 채팅 영역 */}
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
          <textarea className="chat-input" placeholder="comes up 예제 추가해 주세요." defaultValue="" />
          <button className="chat-send"><img src={send} alt="send button" /></button>
        </div>
      </div>
    </div>
  );
}

export default Learn;

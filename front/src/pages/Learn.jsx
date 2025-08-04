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
  const [audioElement, setAudioElement] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [languageData, setLanguageData] = useState([]);


  const goPrev = () => setPageNum(p => Math.max(p - 1, 1));
  const goNext = () => setPageNum(prev => Math.min(prev + 1, pages.length));

  // 처음부터 읽기 함수
  const handleReadFromStart = () => {
    setPageNum(1);
  };

  const langLabel = {ko: '한국어', fr: '프랑스어',ja: '일본어', en: '영어', es: '스페인어', de: '독일어',};

  // 데이터 로딩을 useEffect로 이동
  useEffect(() => {
    fetch(`http://localhost:3000/learn/1?lang=${lang}`)
      .then(res => res.json())
      .then(result => {
        console.log('백엔드에서 받은 데이터:', result);
        console.log('페이지 데이터:', result.pages);
        setPages(result.pages);
        setLanguageData(result.language);
        
        // 첫 번째 페이지의 오디오 경로 확인
        if (result.pages && result.pages.length > 0) {
          console.log('첫 번째 페이지 오디오 경로:', result.pages[0].audiopath);
        }
      })
      .catch(error => {
        console.error('데이터 로딩 오류:', error);
      });
  }, [lang]); // 언어가 변경될 때마다 실행

  const togglePlay = async () => {
    if (!audioRef.current) {
      console.error('오디오 요소가 없습니다');
      return;
    }
    
    const currentAudioPath = pages[pageNum - 1]?.audiopath;
    console.log('재생하려는 오디오 경로:', currentAudioPath);
    console.log('현재 페이지 번호:', pageNum);
    console.log('오디오 요소 src:', audioRef.current.src);
    console.log('오디오 요소 readyState:', audioRef.current.readyState);
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // 오디오가 로드되지 않았다면 다시 로드
        if (audioRef.current.readyState === 0) {
          console.log('오디오를 다시 로드합니다');
          audioRef.current.load();
          
          // 로드 완료까지 기다림
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('오디오 로드 타임아웃')), 5000);
            audioRef.current.addEventListener('canplay', () => {
              clearTimeout(timeout);
              resolve();
            }, { once: true });
            audioRef.current.addEventListener('error', () => {
              clearTimeout(timeout);
              reject(new Error('오디오 로드 실패'));
            }, { once: true });
          });
        }
        
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('오디오 재생 오류:', error);
      console.error('오디오 재생 오류 세부사항:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
      toast.error(`오디오 파일을 재생할 수 없습니다: ${error.message}`);
      setIsPlaying(false);
    }
  };

  // 오디오 요소 생성 및 관리
  useEffect(() => {
    if (pages.length === 0) return;
    const current = pages[pageNum - 1];
    if (!current?.audiopath) return;

    // 기존 오디오 정리
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }

    // 새 오디오 요소 생성
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    
    // 이벤트 리스너 추가
    const handleLoadStart = () => console.log('오디오 로딩 시작:', current.audiopath);
    const handleCanPlay = () => console.log('오디오 재생 가능:', current.audiopath);
    const handleError = (e) => {
      console.error('오디오 로딩 오류:', e);
      console.error('오디오 경로:', current.audiopath);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    // 오디오 소스 설정
    audio.src = current.audiopath;
    
    // ref와 state 설정
    audioRef.current = audio;
    setAudioElement(audio);
    setIsPlaying(false);

    // \n 처리해서 캡션 설정
    if (current.caption) {
      const cleanCaption = current.caption.replace(/\\n/g, '\n');
      setCaption(cleanCaption);
    }

    // 정리 함수
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, [pageNum, pages]); // audioElement 의존성 제거


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
      <div className="div1" onClick={handleReadFromStart}><span className="read-start">처음부터 읽기</span></div>
     
     
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

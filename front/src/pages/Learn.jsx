import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { StoryContext } from "../context/StoryContext";

// toast (alert 대체용)
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../style/Storylearn.css';
import '../style/Learn.css';
import '../style/Note.css';
import '../style/Polachat.css';

function Learn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const noteTitleRef = useRef(null);
  const noteContentRef = useRef(null);
  const chatInputRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [caption, setCaption] = useState('');
  const [lang, setLang] = useState('ko');
  const [audioElement, setAudioElement] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [languageData, setLanguageData] = useState([]);

  const [chatMessages, setChatMessages] = useState([
    { type: 'user', content: 'comes up이란 뜻이 뭐야?' },
    { type: 'tutor', content: '"comes up"은 발생하다라는 뜻이에요' }
  ]);
  
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { user, token } = useContext(AuthContext);
  const storyContext = useContext(StoryContext);
  const stories = storyContext?.stories || [];
  
  // 언어 라벨 정의 
  const langLabel = {ko: '한국어', fr: '프랑스어', ja: '일본어', en: '영어', es: '스페인어', de: '독일어'};

  // URL에서 storyid 가져오기
  const storyid = searchParams.get('storyid') || 1;

  // 현재 story 정보 추출
  const currentStoryId = pages[pageNum - 1]?.storyid || pages[0]?.storyid || storyid;
  const currentStoryObj = stories?.find(s => s.storyid === Number(currentStoryId));
  const currentLangLevel = currentStoryObj?.langlevel || "A1";
  const currentLang = lang;

  const goPrev = () => setPageNum(p => Math.max(p - 1, 1));
  const goNext = () => setPageNum(prev => Math.min(prev + 1, pages.length));

  // 처음부터 읽기 함수
  const handleReadFromStart = () => {
    setPageNum(1);
  };

  // 데이터 로딩
  useEffect(() => {
    fetch(`http://localhost:3000/learn/${storyid}?lang=${lang}`)
      .then(res => res.json())
      .then(result => {
        console.log('백엔드에서 받은 데이터:', result);
        setPages(result.pages || []);
        setLanguageData(result.language || []);
        
        if (result.pages && result.pages.length > 0) {
          console.log('첫 번째 페이지 오디오 경로:', result.pages[0].audiopath);
        }
      })
      .catch(error => {
        console.error('데이터 로딩 오류:', error);
      });
  }, [lang, storyid]);

  const togglePlay = async () => {
    if (!audioRef.current) {
      console.error('오디오 요소가 없습니다');
      return;
    }
    
    // const currentAudioPath = pages[pageNum - 1]?.audiopath;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // 오디오가 로드되지 않았다면 다시 로드
        if (audioRef.current.readyState === 0) {
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
      toast.error(`오디오 파일을 재생할 수 없습니다: ${error.message}`);
      setIsPlaying(false);
    }
  };

  // 오디오 요소 생성 및 관리 - ESLint 경고 해결을 위해 eslint-disable 사용
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // 오디오 소스 설정 (경로 변환 적용)
    audio.src = getCorrectAudioPath(current.audiopath);
    
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
  }, [pageNum, pages, audioElement]);
  // audioElement를 의존성에 추가하면 무한 렌더링 발생하므로 eslint-disable 사용

  // 자막 줄바꿈 포맷 함수 
  const formatCaption = text => {
    return text
      .split('\n')
      .filter(Boolean)
      .map((line, i) => <p key={i}>{line.trim()}</p>);
  };

  const handleCloseClick = () => navigate(-1);

  // 노트 저장 함수 - 토큰 검증 개선
  const handleSaveNote = async () => {
    const titleEl = noteTitleRef.current;
    const contentEl = noteContentRef.current;
    const title = titleEl?.value.trim();
    const content = contentEl?.value.trim();

    if (!title || !content) {
      toast.warn("제목과 내용을 모두 입력하세요.");
      return;
    }

    // 사용자 인증 확인
    if (!user?.userid) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const noteData = {
      userid: user.userid,
      storyid: currentStoryId,
      langlevel: currentLangLevel,
      lang: currentLang,
      title,
      content,
    };

    try {
      const headers = {
        "Content-Type": "application/json"
      };

      // 토큰이 있는 경우에만 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:3000/notes", {
        method: "POST",
        headers,
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("인증이 필요합니다. 다시 로그인해주세요.");
          return;
        }
        throw new Error(`노트 저장 실패 (status ${response.status})`);
      }

      const result = await response.json();
      console.log("노트 저장됨:", result);
      toast.success("노트가 저장되었습니다!");

      // 입력 필드 초기화
      if (titleEl) titleEl.value = "";
      if (contentEl) contentEl.value = "";
    } catch (error) {
      console.error("노트 저장 중 오류:", error.message);
      if (error.message.includes('401')) {
        toast.error("인증이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        toast.error("노트 저장에 실패했습니다.");
      }
    }
  };

  // 튜터 채팅 전송 함수 추가
  const handleChatSend = async () => {
    const chatInput = chatInputRef.current;
    const message = chatInput?.value.trim();

    if (!message) {
      toast.warn("메시지를 입력하세요.");
      return;
    }

    // 사용자 인증 확인
    if (!user?.userid) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    // 사용자 메시지 추가
    const newUserMessage = { type: 'user', content: message };
    setChatMessages(prev => [...prev, newUserMessage]);
    chatInput.value = "";
    setIsChatLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json"
      };

      // 토큰이 있는 경우에만 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:3000/tutor/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          userid: user.userid,
          storyid: currentStoryId,
          message: message,
          lang: currentLang
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("인증이 필요합니다. 다시 로그인해주세요.");
          return;
        }
        throw new Error(`튜터 응답 실패 (status ${response.status})`);
      }

      const result = await response.json();
      const tutorMessage = { type: 'tutor', content: result.response || "죄송합니다. 응답을 생성할 수 없습니다." };
      setChatMessages(prev => [...prev, tutorMessage]);

    } catch (error) {
      console.error("튜터 채팅 오류:", error.message);
      const errorMessage = { type: 'tutor', content: "죄송합니다. 현재 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요." };
      setChatMessages(prev => [...prev, errorMessage]);
      
      if (error.message.includes('401')) {
        toast.error("인증이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        toast.error("튜터 서비스 연결에 실패했습니다.");
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  // Enter 키로 채팅 전송 - onKeyDown으로 변경
  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  // 이미지 경로 수정 함수
  const getCorrectImagePath = (imagepath) => {
    if (!imagepath) return '';
    
    if (imagepath.startsWith('/img/')) {
      return imagepath.replace('/img/', '/img/');
    }
    
    if (imagepath.startsWith('/img/')) {
      return imagepath;
    }
    
    return imagepath;
  };

  // 오디오 경로 변환 함수 (useCallback으로 감싸기)
  const getCorrectAudioPath = useCallback((audiopath) => {
    if (!audiopath) return '';
    const azurePrefix = 'https://polytalesimg.blob.core.windows.net/audio/';
    let localPath = '';
    if (audiopath.startsWith(azurePrefix)) {
      localPath = audiopath.replace(azurePrefix, '');
      // A1 → a1 변환
      localPath = localPath.replace(/^A1\//, 'a1/');
    } else if (audiopath.startsWith('/audio/')) {
      localPath = audiopath.replace('/audio/A1/', '/audio/a1/');
      localPath = localPath.replace('/audio/', '');
    } else if (audiopath.startsWith('A1/')) {
      localPath = 'a1/' + audiopath.slice(3);
    } else {
      localPath = audiopath;
    }

    // 파일명에 언어코드가 없으면 추가 (예: lily_1.mp3 → lily_1_ko.mp3)
    const extIdx = localPath.lastIndexOf('.mp3');
    if (extIdx > -1 && !localPath.includes(`_${lang}.mp3`)) {
      localPath = localPath.slice(0, extIdx) + `_${lang}.mp3`;
    }

    return '/audio/' + localPath;
  }, [lang]);

  return (
    <div className="parent">
      <div className="div1" onClick={handleReadFromStart}><span className="read-start">처음부터 읽기</span></div>
     
      <div className="div2">
        <h2 className="story-title">{currentStoryObj?.storytitle || "Lily's happy day"}</h2>
        <button className="close-button" onClick={handleCloseClick}>
          <img src="/img/learn/close.png" alt="close" />
        </button>
      </div>

      {/* 이미지 및 자막 영역 */}
      <div className="div3">
        <div className="story-image-container">
          {pages.length > 0 && (<>
            <img 
              src={getCorrectImagePath(pages[pageNum - 1]?.imagepath)} 
              alt={`Page ${pageNum}`} 
              className="story-img" 
            />
            <div className="caption-text">{formatCaption(caption)}</div>
            <div className="caption-box">
              <div className="control-btns">
                <button
                  onClick={goPrev}
                  disabled={pageNum === 1}
                  className={`btn Text${pageNum === 1 ? ' disabled' : ''}`}
                >
                  <img src="/img/learn/prev.png" alt="previous" className="icon" />
                  <span>이전 문장</span>
                </button>
                <button onClick={togglePlay} className="btn pause">
                  <img 
                    src={isPlaying ? "/img/learn/pause.png" : "/img/learn/play.png"} 
                    alt="play/pause" 
                  />
                </button>
                <button onClick={goNext} disabled={pageNum === pages.length} className="btn Text">
                  <img src="/img/learn/next.png" alt="next" className="icon" />
                  <span>다음 문장</span>
                </button>
              </div>
            </div>
            <div className="progress-bar"><div className="progress" style={{ width: `${(pageNum / pages.length) * 100}%` }} /></div>
          </>)}
        </div>
      </div>

      {/* 문법 영역 */}
      {languageData.length > 0 && (
        <div className="div4 grammar">
          <h4>문법</h4>
          <div className="grammar-list">
            {lang === 'ko'
              ? languageData
                  .filter((item, idx) => idx % 10 === (pageNum - 1) % 10)
                  .slice(0, 1)
                  .map((item, idx) => (
                    <p key={idx}>{item.grammar}</p>
                  ))
              : languageData
                  .slice((pageNum - 1) * 5, pageNum * 5)
                  .map((item, idx) => (
                    <p key={idx}>{item.grammar}</p>
                  ))}
          </div>
        </div>
      )}

      {/* 단어 영역 */}
      {languageData.length > 0 && (
        <div className="div5 voca">
          <h4>단어</h4>
          <div className="voca-list">
            {lang === 'ko'
              ? languageData
                  .filter((item, idx) => idx % 10 === (pageNum - 1) % 10)
                  .slice(0, 1)
                  .map((item, idx) => (
                    <p key={idx}>{item.voca}</p>
                  ))
              : languageData
                  .slice((pageNum - 1) * 5, pageNum * 5)
                  .map((item, idx) => (
                    <p key={idx}>{item.voca}</p>
                  ))}
          </div>
        </div>
      )}

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
          <img src="/img/learn/disk_icon.png" className='save-note' onClick={handleSaveNote} alt="save note" />
        </div>
        <div className="note-title">
          <label htmlFor="noteTitle" className="underline-note">Title :</label>
          <input id="noteTitle" ref={noteTitleRef} type="text" className="note-input underline" />
        </div>
        <textarea className="note-content" placeholder="" ref={noteContentRef} defaultValue="" />
      </div>

      {/* 채팅 영역 - 실제 API 연결 */}
      <div className="div8">
        <div>
          <div className="tutor-lang-select">
            <span className="tutor-info">채팅 내역은 저장되지 않습니다.</span>
            <span className="tutor-info notelang">노트로 저장</span>
          </div>  
        </div>
        <div className="chat-header">
          <div className="pola-badge">
            <span className="tutor-ai">AI tutor Pola</span>
            <img src="/img/learn/pola.png" alt="pola" className="tutor-icon" />
          </div>
        </div>
        <div className="chat-messages">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.content}
            </div>
          ))}
          {isChatLoading && (
            <div className="message tutor">
              <span>응답을 생성하고 있습니다...</span>
            </div>
          )}
        </div>
        <div className="chat-input-box">
          <textarea 
            ref={chatInputRef}
            className="chat-input" 
            placeholder="comes up 예제 추가해 주세요." 
            onKeyDown={handleChatKeyDown}
            disabled={isChatLoading}
          />
          <button 
            className="chat-send" 
            onClick={handleChatSend}
            disabled={isChatLoading}
          >
            <img src="/img/learn/send.png" alt="send button" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Learn;
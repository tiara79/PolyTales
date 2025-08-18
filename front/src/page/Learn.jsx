// src/pages/Learn.jsx
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import AudioPlayer from "../component/AudioPlayer";
import { AuthContext } from "../context/AuthContext";
import { StoryContext } from "../context/StoryContext";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../style/Learn.css"; // 전체 영역
import "../style/Note.css"; // 노트
import "../style/PolaChat.css"; //튜터
import "../style/StoryLearn.css"; // 이미지 영역

function Learn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const noteTitleRef = useRef(null);
  const noteContentRef = useRef(null);
  const chatInputRef = useRef(null);

  const [pages, setPages] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  // const [caption, setCaption] = useState("");
  const [lang, setLang] = useState("ko");

  const [languageData, setLanguageData] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const { stories } = useContext(StoryContext);

  // 메모이제이션된 계산 값들
  const storyid = useMemo(() => searchParams.get("storyid") || 1, [searchParams]);
  const currentStory = useMemo(() => 
    stories.find((s) => s.storyid === Number(storyid)), 
    [stories, storyid]
  );
  const currentLangLevel = useMemo(() => 
    currentStory?.langlevel || "A1", 
    [currentStory]
  );
  const isAuthenticated = useMemo(() => 
    Boolean(user?.userid), 
    [user?.userid]
  );
  const currentPage = useMemo(() => 
    pages[pageNum - 1] || {}, 
    [pages, pageNum]
  );
  const image = useMemo(() => 
    currentPage?.imagepath || "/img/home/no_image.png", 
    [currentPage?.imagepath]
  );

  const handleCloseClick = useCallback(() => navigate("/"), [navigate]);
  const handleReadFromStart = useCallback(() => setPageNum(1), []);

  useEffect(() => {
    const fetchLearnData = async () => {
      try {
        const response = await axios.get(`/learn/${storyid}?lang=${lang}`);
        console.log("Learn data:", response.data); // 디버깅용
        setPages(response.data.pages || []);
        setLanguageData(response.data.language || []);
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
      }
    };

    fetchLearnData();
  }, [lang, storyid]);

  const saveNote = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const title = noteTitleRef.current?.value.trim();
    const content = noteContentRef.current?.value.trim();
    
    if (!title || !content) {
      toast.warn("제목과 내용을 입력하세요.");
      return;
    }

    const noteData = {
      userid: user.userid,
      storyid,
      langlevel: currentLangLevel,
      lang,
      title,
      content,
    };

    try {
      await axios.post('/notes', noteData);
      toast.success("노트가 저장되었습니다!");
      noteTitleRef.current.value = "";
      noteContentRef.current.value = "";
    } catch (error) {
      console.error("노트 저장 오류:", error);
      toast.error("노트 저장 중 오류가 발생했습니다.");
    }
  }, [isAuthenticated, user?.userid, storyid, currentLangLevel, lang]);

  const handleChatSend = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const msg = chatInputRef.current?.value.trim();
    if (!msg) {
      toast.warn("메시지를 입력하세요.");
      return;
    }

    setChatMessages((prev) => [...prev, { type: "user", content: msg }]);
    chatInputRef.current.value = "";
    setIsChatLoading(true);

    try {
      const response = await axios.post('/tutor/chat', {
        userid: user.userid, 
        storyid, 
        message: msg, 
        lang
      });
      
      setChatMessages((prev) => [...prev, { 
        type: "tutor", 
        content: response.data.response || "응답 없음" 
      }]);
    } catch (error) {
      console.error("채팅 오류:", error);
      setChatMessages((prev) => [...prev, { 
        type: "tutor", 
        content: "서비스 오류가 발생했습니다." 
      }]);
      toast.error("AI 튜터 서비스 오류");
    } finally {
      setIsChatLoading(false);
    }
  }, [isAuthenticated, user?.userid, storyid, lang]);

  const handleChatKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  }, [handleChatSend]);

  // 언어 선택 컴포넌트 메모이제이션
  const languageSelector = useMemo(() => {
    const languageNames = {
      ko: "한국어",
      fr: "프랑스어", 
      ja: "일본어",
      en: "영어",
      es: "스페인어",
      de: "독일어"
    };

    return ["ko", "fr", "ja", "en", "es", "de"].map((code) => (
      <label key={code}>
        <input 
          type="radio" 
          name="option" 
          value={code} 
          checked={lang === code} 
          onChange={() => setLang(code)} 
        />
        {languageNames[code]}
      </label>
    ));
  }, [lang]);

  return (
    <div className="parent">
      <div className="div1" onClick={handleReadFromStart}><span className="read-start">처음부터 읽기</span></div>
      <div className="div2">
        <h2 className="story-title">{currentStory?.storytitle || "제목 없음"}</h2>
        <button className="close-button" onClick={handleCloseClick}><img src="/img/learn/close.png" alt="close" /></button>
      </div>

      <div className="div3">
        <div className="story-image-container">
          <img className="story-img" src={image} alt={`page-${pageNum}`} />
          <div className="caption-text" dangerouslySetInnerHTML={{
            __html: (currentPage.caption || "").replace(/\n/g, '<br>')
          }}></div>
        </div>
        
        {/* 오디오 플레이어는 항상 이미지 아래 고정 위치에 표시 */}
        <AudioPlayer 
          pages={pages} 
          pageNum={pageNum} 
          setPageNum={setPageNum}
          autoAdvance={false}
        />
      </div>

      <div className="div4 grammar">
        <h4>문법</h4>
        <div className="grammar-list">
          {lang === "ko" ? <p>한국어는 자막만 제공합니다.</p> : languageData.map((d, i) => <p key={i}>{d.grammar}</p>)}
        </div>
      </div>

      <div className="div5 voca">
        <h4>단어</h4>
        <div className="voca-list">
          {lang === "ko" ? <p>한국어는 자막만 제공합니다.</p> : languageData.map((d, i) => <p key={i}>{d.voca}</p>)}
        </div>
      </div>

      <div className="div6 lang-select">
        {languageSelector}
      </div>

      {/* 노트 기능 - 항상 표시하되 로그인 상태에 따라 기능 제한 */}
      <div className="div7 note-box">
        <div className="note-head">
          <strong>Note</strong>
          <img 
            src="/img/learn/disk_icon.png" 
            alt="save" 
            className={`save-note ${!isAuthenticated ? 'disabled' : ''}`}
            onClick={isAuthenticated ? saveNote : () => toast.info("로그인하면 노트를 저장할 수 있습니다.")}
          />
        </div>
        <div className="note-title">
          <label>
            Title: 
            <input 
              ref={noteTitleRef} 
              type="text" 
              className="note-input underline" 
              disabled={!isAuthenticated}
              placeholder={!isAuthenticated ? "로그인하면 노트를 작성할 수 있습니다" : "노트 제목을 입력하세요"}
            />
          </label>
        </div>
        <textarea 
          className="note-content" 
          ref={noteContentRef} 
          disabled={!isAuthenticated}
          placeholder={!isAuthenticated ? "로그인하면 노트를 작성할 수 있습니다" : "노트 내용을 입력하세요"}
        />
        {!isAuthenticated && (
          <div className="login-prompt">
            <button onClick={() => navigate('/login')} className="login-button">
              로그인하여 노트 기능 사용하기
            </button>
          </div>
        )}
      </div>

      {/* AI 튜터 채팅 - 항상 표시하되 로그인 상태에 따라 기능 제한 */}
      <div className="div8">
        <div className="chat-header">
          <div className="pola-badge">
            <span className="tutor-ai">AI tutor Pola</span>
            <img src="/img/learn/pola.png" alt="pola" className="tutor-icon" />
          </div>
        </div>

        <div className="chat-messages">
          {!isAuthenticated && (
            <div className="message tutor welcome">
              안녕하세요! AI 튜터 Pola입니다. 로그인하시면 궁금한 것을 언제든 물어보실 수 있어요! 📚✨
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>
              {msg.content}
            </div>
          ))}
          {isChatLoading && <div className="message tutor">응답 생성 중...</div>}
        </div>

        <div className="chat-input-box">
          <textarea 
            ref={chatInputRef} 
            onKeyDown={handleChatKeyDown} 
            className="chat-input" 
            disabled={!isAuthenticated || isChatLoading}
            placeholder={!isAuthenticated ? "로그인하면 AI 튜터와 대화할 수 있습니다" : "궁금한 것을 물어보세요..."}
          />
          <button 
            className={`chat-send ${!isAuthenticated ? 'disabled' : ''}`}
            onClick={isAuthenticated ? handleChatSend : () => toast.info("로그인하면 AI 튜터와 대화할 수 있습니다.")}
            disabled={!isAuthenticated || isChatLoading}
          >
            <img src="/img/learn/send.png" alt="send" />
          </button>
        </div>
        
        {!isAuthenticated && (
          <div className="login-prompt">
            <button onClick={() => navigate('/login')} className="login-button">
              로그인하여 AI 튜터와 대화하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Learn;
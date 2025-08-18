// src/pages/Learn.jsx
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AudioPlayer from "../component/AudioPlayer";
import { API_URL } from "../config/AppConfig";
import { AuthContext } from "../context/AuthContext";
import { StoryContext } from "../context/StoryContext";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../style/Learn.css";
import "../style/Note.css";
import "../style/PolaChat.css";
import "../style/StoryLearn.css";

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

  const { user, token } = useContext(AuthContext);
  const { stories } = useContext(StoryContext);

  const storyid = searchParams.get("storyid") || 1;
  const currentStory = stories.find((s) => s.storyid === Number(storyid));
  const currentLangLevel = currentStory?.langlevel || "A1";

  const handleCloseClick = () => navigate("/");
  const handleReadFromStart = () => setPageNum(1);

  useEffect(() => {
    fetch(`${API_URL}/learn/${storyid}?lang=${lang}`)
      .then((res) => res.json())
      .then((result) => {
        setPages(result.pages || []);
        setLanguageData(result.language || []);
      })
      .catch((e) => console.error("데이터 로딩 오류:", e));
  }, [lang, storyid]);

  // ===== 유틸리티 함수 최적화 =====
  const isAuthenticated = Boolean(user?.userid);
  
  const createApiHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const saveNote = async () => {
    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const title = noteTitleRef.current?.value.trim();
    const content = noteContentRef.current?.value.trim();
    
    // 제목과 내용이 모두 비어있을 때
    if (!title && !content) {
      toast.warn("제목 또는 내용을 입력해주세요.");
      return;
    }

    // 내용만 있고 제목이 없을 때는 기본 제목 사용
    const finalTitle = title || `스토리 노트 - ${new Date().toLocaleDateString()}`;
    
    // 노트 내용이 있고 div8(채팅) 내용이 없을 시 [] 추가
    let finalContent = content;
    if (content && chatMessages.length === 0) {
      finalContent = content + "\n\n[]";
    } else if (!content) {
      // 내용이 없으면 기본 메시지
      finalContent = "내용이 비어있습니다.";
    }

    const noteData = {
      userid: user.userid,
      storyid,
      langlevel: currentLangLevel,
      lang,
      title: finalTitle,
      content: finalContent,
    };

    try {
      const res = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: createApiHeaders(),
        body: JSON.stringify(noteData),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "노트 저장 실패");
      }
      
      toast.success("노트가 저장되었습니다!");
      noteTitleRef.current.value = "";
      noteContentRef.current.value = "";
    } catch (err) {
      console.error("노트 저장 오류:", err);
      
      // 네트워크 오류 또는 서버 응답 없음
      if (!navigator.onLine) {
        toast.error("인터넷 연결을 확인해주세요.");
      } else if (err.name === 'TypeError' || err.message.includes('fetch')) {
        toast.error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      } else if (err.message.includes("401") || err.message.includes("인증")) {
        toast.error("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else if (err.message.includes("500") || err.message.includes("서버")) {
        toast.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        // 저장 에러 시 입력한 text 그대로 유지
        toast.error("저장 중 오류가 발생했습니다. 내용을 확인하고 다시 시도해주세요.");
      }
    }
  };

  const handleChatSend = async () => {
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
      const res = await fetch(`${API_URL}/tutor/chat`, {
        method: "POST",
        headers: createApiHeaders(),
        body: JSON.stringify({ userid: user.userid, storyid, message: msg, lang }),
      });
      
      const data = await res.json();
      setChatMessages((prev) => [...prev, { 
        type: "tutor", 
        content: data.response || "응답 없음" 
      }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { 
        type: "tutor", 
        content: "서비스 오류가 발생했습니다." 
      }]);
      toast.error("AI 튜터 서비스 오류");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const handleNoteTransfer = async () => {
    if (!isAuthenticated) {
      toast.info("로그인하면 노트로 전송할 수 있습니다.");
      return;
    }

    if (chatMessages.length === 0) {
      toast.warn("전송할 채팅 내역이 없습니다.");
      return;
    }

    // 채팅 내역을 노트 형태로 변환
    const chatHistory = chatMessages
      .map((msg, index) => `${msg.type === 'user' ? '나' : 'AI tutor Pola'}: ${msg.content}`)
      .join('\n\n');

    // 기존 노트 내용 확인
    const existingTitle = noteTitleRef.current?.value.trim() || "";
    const existingContent = noteContentRef.current?.value.trim() || "";

    // 노트 제목 설정 (기존 제목이 없으면 새로 생성)
    if (!existingTitle) {
      noteTitleRef.current.value = `AI 튜터 대화 기록 - ${new Date().toLocaleString()}`;
    }

    // 노트 내용 설정 (기존 내용이 있다면 아래에 추가)
    let newContent = chatHistory;
    if (existingContent) {
      newContent = `${existingContent}\n\n=== AI 튜터 대화 기록 ===\n${chatHistory}`;
    }
    
    noteContentRef.current.value = newContent;

    toast.success("채팅 내역이 노트로 전송되었습니다!");

    // 자동 저장 실행
    try {
      const noteData = {
        userid: user.userid,
        storyid,
        langlevel: currentLangLevel,
        lang,
        title: noteTitleRef.current.value.trim() || "AI 튜터 대화 기록",
        content: newContent,
      };

      const res = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: createApiHeaders(),
        body: JSON.stringify(noteData),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "노트 저장 실패");
      }
      
      toast.success("노트가 저장되었습니다!");
      
      // 저장 후 채팅 내역 초기화 여부를 사용자에게 물어보기
      const shouldClearChat = window.confirm("채팅 내역을 초기화하시겠습니까?");
      if (shouldClearChat) {
        setChatMessages([]);
        toast.info("채팅 내역이 초기화되었습니다.");
      }
    } catch (err) {
      console.error("노트 저장 오류:", err);
      
      // 네트워크 오류 또는 서버 응답 없음
      if (!navigator.onLine) {
        toast.error("인터넷 연결을 확인해주세요.");
      } else if (err.name === 'TypeError' || err.message.includes('fetch')) {
        toast.error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      } else if (err.message.includes("401") || err.message.includes("인증")) {
        toast.error("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else if (err.message.includes("500") || err.message.includes("서버")) {
        toast.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        // 저장 에러 시 입력한 text 그대로 유지
        toast.error("채팅 내역 저장 중 오류가 발생했습니다. 내용을 확인하고 다시 시도해주세요.");
      }
    }
  };

  const currentPage = pages[pageNum - 1] || {};
  const image = currentPage?.imagepath || "/img/home/no_image.png";

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
        {["ko", "fr", "ja", "en", "es", "de"].map((code) => {
          const languageNames = {
            ko: "한국어",
            fr: "프랑스어", 
            ja: "일본어",
            en: "영어",
            es: "스페인어",
            de: "독일어"
          };
          return (
            <label key={code}>
              <input type="radio" name="option" value={code} checked={lang === code} onChange={() => setLang(code)} />
              {languageNames[code]}
            </label>
          );
        })}
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
          <div className="chat-notice">채팅내역은 저장되지 않습니다.</div>
          <button 
            className={`note-transfer-btn ${!isAuthenticated ? 'disabled' : ''}`}
            onClick={handleNoteTransfer}
            disabled={!isAuthenticated}
          >
            노트로 저장
          </button>
        </div>
        
        <div className="pola-section">
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
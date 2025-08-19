// src/pages/Learn.jsx
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { StoryContext } from "../context/StoryContext";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../style/Learn.css";
import "../style/Note.css";
import "../style/PolaChat.css";
import "../style/StoryLearn.css";
import pause from "../style/img/learn/button/pause.png";
import play from "../style/img/learn/button/play.png";

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
  const [isPlaying, setIsPlaying] = useState(false);

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
  const goPrev = () => setPageNum((p) => Math.max(1, p - 1));
  const goNext = () => setPageNum((p) => Math.min(p + 1, pages.length));

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/learn/${storyid}?lang=${lang}`)
      .then((res) => res.json())
      .then((result) => {
        setPages(result.pages || []);
        setLanguageData(result.language || []);
      })
      .catch((e) => console.error("데이터 로딩 오류:", e));
  }, [lang, storyid]);

  const saveNote = async () => {
    const title = noteTitleRef.current?.value.trim();
    const content = noteContentRef.current?.value.trim();
    if (!title || !content) return toast.warn("제목과 내용을 입력하세요.");
    if (!user?.userid) return toast.error("로그인이 필요합니다.");

    const noteData = {
      userid: user.userid,
      storyid,
      langlevel: currentLangLevel,
      lang,
      title,
      content,
    };
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${process.env.REACT_APP_API_URL}/notes`, {
        method: "POST",
        headers,
        body: JSON.stringify(noteData),
      });
      if (!res.ok) throw new Error("노트 저장 실패");
      toast.success("노트가 저장되었습니다!");
      noteTitleRef.current.value = "";
      noteContentRef.current.value = "";
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChatSend = async () => {
    const msg = chatInputRef.current?.value.trim();
    if (!msg) return toast.warn("메시지를 입력하세요.");
    if (!user?.userid) return toast.error("로그인이 필요합니다.");

    setChatMessages((prev) => [...prev, { type: "user", content: msg }]);
    chatInputRef.current.value = "";
    setIsChatLoading(true);

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${process.env.REACT_APP_API_URL}/tutor/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userid: user.userid, storyid, message: msg, lang }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { type: "tutor", content: data.response || "응답 없음" }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { type: "tutor", content: "서비스 오류" }]);
      toast.error("tutor service error");
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

  // 이미지/오디오 경로 최적화
  function getValidPath(path, fallback) {
    if (!path) return fallback;
    return path.startsWith("/") ? path : `/${path}`;
  }

  // formatCaption 함수 추가 (자막 포맷팅, 필요시 커스텀)
  function formatCaption(caption) {
    return caption || "";
  }

  const togglePlay = useCallback(() => {
    const audioEl = document.querySelector("audio");
    if (audioEl) {
      if (audioEl.paused) {
        audioEl.play();
        setIsPlaying(true);
      } else {
        audioEl.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  const currentPage = pages[pageNum - 1] || {};
  const image =
    getValidPath(
      currentPage.image ||
      currentPage.imagepath ||
      currentPage.storycoverpath ||
      currentPage.thumbnail_url,
      "/img/home/no_image.png"
    );
  const audio =
    getValidPath(
      currentPage.audio ||
      currentPage.audiopath ||
      currentPage.storyaudiopath,
      ""
    );
  const caption = currentPage.caption || ""; // 자막 항상 표시

  return (
    <div className="parent">
      <div className="div1" onClick={handleReadFromStart}><span className="read-start">처음부터 읽기</span></div>
      <div className="div2">
        <h2 className="story-title">{currentStory?.storytitle || "제목 없음"}</h2>
        <button className="close-button" onClick={handleCloseClick}>
          <img src="/img/learn/close.png" alt="close" />
        </button>
      </div>

      {/* 이미지 및 자막 영역 */}
      <div className="div3">
        <div className="story-image-container">
          {pages.length > 0 && (
            <>
              <img
                src={pages[pageNum - 1]?.imagepath || "/img/home/no_image.png"}
                alt={`Page ${pageNum}`}
                className="story-img"
                onError={e => { e.currentTarget.src = "/img/home/no_image.png"; }}
              />
              <div className="caption-text">{formatCaption(pages[pageNum - 1]?.caption)}</div>
              <div className="caption-box">
                <div className="control-btns">
                  <button onClick={goPrev} disabled={pageNum === 1} className="btn Text">
                    <span className="icon" />
                    <span>이전 문장</span>
                  </button>
                  <button onClick={togglePlay} className="btn pause">
                    <img src={isPlaying ? pause : play} alt="play/pause" />
                  </button>
                  <button onClick={goNext} disabled={pageNum === pages.length} className="btn Text">
                    <span className="icon" />
                    <span>다음 문장</span>
                  </button>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${(pageNum / pages.length) * 100}%` }} />
              </div>
              {/* 오디오 태그는 숨김 처리 또는 필요시 추가 */}
              <audio
                src={pages[pageNum - 1]?.audio || ""}
                style={{ display: "none" }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </>
          )}
        </div>
      </div>

         {/* 문법/단어 영역 */}
      <div className="div4 grammar">
        <h4>문법</h4>
        <div className="grammar-list">
          {lang === "ko" ? <p>한국어는 자막만 제공합니다.</p> : languageData.map((d, i) => <p key={i}>{d.grammar}</p>)}
        </div>
      </div>

      <div className="div5 voca">
        <h4>단어</h4>
        <div className="voca-list">
          {lang === "ko" ? <p>한국어는 자막만 제공합니다.</p> : languageData.map((d, i) => <p key={i}>{d.word}</p>)}
        </div>
      </div>

      <div className="div6 lang-select">
        {[
          { code: "ko", label: "한국어" },
          { code: "fr", label: "프랑스어" },
          { code: "ja", label: "일본어" },
          { code: "en", label: "영어" },
          { code: "es", label: "스페인어" },
          { code: "de", label: "독일어" },
        ].map(({ code, label }) => (
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

      <div className="div7 note-box">
        <div className="note-head">
          <strong>Note</strong>
          <img src="/img/learn/disk_icon.png" alt="save" className="save-note" onClick={saveNote} />
        </div>
        <div className="note-title">
          <label>Title: <input ref={noteTitleRef} type="text" className="note-input underline" /></label>
        </div>
        <textarea className="note-content" ref={noteContentRef} />
      </div>

      <div className="div8">
        <div className="chat-header">
          <div className="pola-badge">
            <span className="tutor-ai">AI tutor Pola</span>
            <img src="/img/learn/pola.png" alt="pola" className="tutor-icon" />
          </div>
        </div>

        <div className="chat-messages">
          {chatMessages.map((msg, i) => <div key={i} className={`message ${msg.type}`}>{msg.content}</div>)}
          {isChatLoading && <div className="message tutor">응답 생성 중...</div>}
        </div>

        <div className="chat-input-box">
          <textarea ref={chatInputRef} onKeyDown={handleChatKeyDown} className="chat-input" disabled={isChatLoading} />
          <button className="chat-send" onClick={handleChatSend} disabled={isChatLoading}><img src="/img/learn/send.png" alt="send" /></button>
        </div>
      </div>
    </div>
  );
}

export default Learn;
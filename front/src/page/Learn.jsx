// src/pages/Learn.jsx
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const goPrev = () => setPageNum((p) => Math.max(1, p - 1));
  const goNext = () => setPageNum((p) => Math.min(p + 1, pages.length));

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/learn/${storyid}?lang=${lang}`)
    // fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/learn/${storyid}?lang=${lang}`)
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
      // const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/notes`, {
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
      // const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/tutor/chat`, {
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

  const currentPage = pages[pageNum - 1] || {};
  // 여러 필드에서 이미지 경로 우선적으로 선택
  const image =
    currentPage?.image ||
    currentPage?.imagepath ||
    currentPage?.storycoverpath ||
    currentPage?.thumbnail_url ||
    "/img/home/no_image.png";
  const audio = currentPage?.audio;
  const caption = currentPage?.caption || ""; // 자막 항상 표시

  return (
    <div className="parent">
      <div className="div1" onClick={handleReadFromStart}><span className="read-start">처음부터 읽기</span></div>
      <div className="div2">
        <h2 className="story-title">{currentStory?.storytitle || "제목 없음"}</h2>
        <button className="close-button" onClick={handleCloseClick}><img src="/img/learn/close.png" alt="close" /></button>
      </div>

      <div className="div3">
        <div className="story-image-container">
          <img
            className="story-img"
            src={image}
            alt={`page-${pageNum}`}
            onError={e => { e.currentTarget.src = "/img/home/no_image.png"; }}
          />
          {/* 페이지 진행률 프로그래스바 */}
          <input
            type="range"
            min={1}
            max={pages.length || 1}
            value={pageNum}
            className="learn-audio-progress"
            style={{ width: "100%", margin: "12px 0" }}
            readOnly
          />
          {/* 자막 항상 표시 */}
          <div className="caption-text">{caption}</div>
          <div className="caption-box">
            <div className="control-btns">
              <button onClick={goPrev}><img src="/img/learn/prev.png" alt="prev" /></button>
              <button onClick={() => document.querySelector("audio")?.play()}><img src="/img/learn/play.png" alt="play" /></button>
              <button onClick={goNext}><img src="/img/learn/next.png" alt="next" /></button>
            </div>
          </div>
          <audio src={audio || ""} controls style={{ width: "100%" }} />
        </div>
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
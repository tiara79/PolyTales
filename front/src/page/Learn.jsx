// src/pages/Learn.jsx
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import AudioPlayer from "../component/AudioPlayer";
import { StoryContext } from "../context/StoryContext";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../style/Learn.css";
import "../style/Note.css";
import "../style/PolaChat.css";
import "../style/StoryLearn.css";

export default function Learn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pages, setPages] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [languageData, setLanguageData] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const noteTitleRef = useRef(null);
  const noteContentRef = useRef(null);
  const chatInputRef = useRef(null);

  const { stories } = useContext(StoryContext);

  const storyid = useMemo(() => searchParams.get("storyid") || 1, [searchParams]);
  const currentStory = useMemo(() => stories.find((s) => s.storyid === Number(storyid)), [stories, storyid]);
  const currentLangLevel = useMemo(() => currentStory?.langlevel || "A1", [currentStory]);

  const currentPage = useMemo(() => pages[pageNum - 1] || {}, [pages, pageNum]);
  const image = useMemo(() => currentPage?.imagepath || "/img/home/no_image.png", [currentPage?.imagepath]);

  const handleCloseClick = useCallback(() => navigate("/"), [navigate]);
  const handleReadFromStart = useCallback(() => setPageNum(1), []);

  useEffect(() => {
    const fetchLearnData = async () => {
      try {
        const response = await axios.get(`/learn/${storyid}?lang=ko`);
        setPages(response.data.pages || []);
        setLanguageData(response.data.language || []);
      } catch (error) {
        setPages([
          {
            imagepath: "/img/a1/lily/lily_1.png",
            audio: "",
            caption: "",
          },
        ]);
        setLanguageData([]);
      }
    };
    fetchLearnData();
  }, [storyid]);

  const saveNote = useCallback(async () => {
    const title = noteTitleRef.current?.value.trim();
    const content = noteContentRef.current?.value.trim();

    if (!title || !content) {
      toast.warn("제목과 내용을 입력하세요.");
      return;
    }
    try {
      const noteData = { storyid: Number(storyid), title, content };
      await axios.post("/notes", noteData);
      toast.success("노트가 저장되었습니다.");
      noteTitleRef.current.value = "";
      noteContentRef.current.value = "";
    } catch (e) {
      toast.error("노트 저장 실패");
    }
  }, [storyid]);

  const [chatMessages, setChatMessages] = useState([]);
  const handleChatSend = useCallback(async () => {
    const text = chatInputRef.current?.value.trim();
    if (!text) return;

    const next = [...chatMessages, { type: "user", content: text }];
    setChatMessages(next);
    chatInputRef.current.value = "";
    setIsChatLoading(true);

    try {
      const response = await axios.post("/tutor/chat", {
        storyid: Number(storyid),
        prompt: text,
      });
      const reply = response.data?.reply || "답변을 가져오지 못했어요.";
      setChatMessages((prev) => [...prev, { type: "tutor", content: reply }]);
    } catch (e) {
      toast.error("AI 튜터 서비스 오류");
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessages, storyid]);

  const handleChatKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChatSend();
      }
    },
    [handleChatSend]
  );

  const languageSelector = useMemo(
    () => (
      <div className="div6">
        <select value="ko" onChange={() => {}} className="language-select">
          <option value="ko">한국어</option>
        </select>
      </div>
    ),
    []
  );

  return (
    <section className="learn-section">
      <button className="close-button" onClick={handleCloseClick}>
        <img src="/img/learn/close.png" alt="close" />
      </button>

      <div className="div1" onClick={handleReadFromStart}>
        <span className="read-start">처음부터 읽기</span>
      </div>

      <div className="div2">
        <h3 className="story-title">{currentStory?.storytitle || "Story"}</h3>
        <span className="level-badge">{currentLangLevel}</span>
      </div>

      <div className="div3">
        <div className="story-image-container">
          <img className="story-img" src={image} alt="page" />
        </div>
        <AudioPlayer pages={pages} pageNum={pageNum} setPageNum={setPageNum} autoAdvance />
      </div>

      <div className="div4">
        <h4>문법</h4>
        <div className="grammar-list">
          {(languageData || []).map((g, i) => (
            <p key={i}>{g?.grammar || ""}</p>
          ))}
        </div>
      </div>

      <div className="div5 voca">
        <h4>단어</h4>
        <div className="voca-list">
          {(languageData || []).map((v, i) => (
            <p key={i}>{v?.word || ""}</p>
          ))}
        </div>
      </div>

      {languageSelector}

      <div className="div7">
        <div className="note-box">
          <div className="title-row">
            <h4 className="note-title">노트</h4>
            <input ref={noteTitleRef} className="note-input" placeholder="노트 제목을 입력하세요" />
          </div>
          <textarea ref={noteContentRef} className="note-textarea" placeholder="노트 내용을 입력하세요" />
          <button className="save-note" onClick={saveNote}>노트 저장</button>
        </div>
      </div>

      <div className="div8">
        <div className="chat-box">
          <div className="chat-messages">
            {chatMessages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.type}`}>{m.content}</div>
            ))}
          </div>
          <div className="chat-input-row">
            <textarea
              ref={chatInputRef}
              className="chat-input"
              placeholder="궁금한 것을 물어보세요..."
              onKeyDown={handleChatKeyDown}
              disabled={isChatLoading}
            />
            <button className="chat-send" onClick={handleChatSend} disabled={isChatLoading}>보내기</button>
          </div>
        </div>
      </div>
    </section>
  );
}

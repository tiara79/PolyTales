// src/pages/Learn.jsx
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import AudioPlayer from "../component/AudioPlayer";
// import { AuthContext } from "../context/AuthContext";
import { StoryContext } from "../context/StoryContext";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../style/Learn.css"; // 전체 영역
import "../style/Note.css"; // 노트
import "../style/PolaChat.css"; //튜터
import "../style/StoryLearn.css"; // 이미지 영역

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

  // const { user } = useContext(AuthContext);
  const { stories } = useContext(StoryContext);

  // 메모값들
  const storyid = useMemo(() => searchParams.get("storyid") || 1, [searchParams]);
  const currentStory = useMemo(
    () => stories.find((s) => s.storyid === Number(storyid)),
    [stories, storyid]
  );
  const currentLangLevel = useMemo(() => currentStory?.langlevel || "A1", [currentStory]);

  // role 활성화
  // const isAuthenticated = true;

  const currentPage = useMemo(() => pages[pageNum - 1] || {}, [pages, pageNum]);
  const image = useMemo(
    () => currentPage?.imagepath || "/img/home/no_image.png",
    [currentPage?.imagepath]
  );

  const handleCloseClick = useCallback(() => navigate("/"), [navigate]);
  const handleReadFromStart = useCallback(() => setPageNum(1), []);

  // 데이터 로드
  useEffect(() => {
    const fetchLearnData = async () => {
      try {
        const response = await axios.get(`/learn/${storyid}?lang=ko`);
        setPages(response.data.pages || []);
        setLanguageData(response.data.language || []);
      } catch (error) {
        // 에러방지 a1
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

  // 노트 저장 (항상 활성화)
  const saveNote = useCallback(async () => {
    const title = noteTitleRef.current?.value.trim();
    const content = noteContentRef.current?.value.trim();

    if (!title || !content) {
      toast.warn("제목과 내용을 입력하세요.");
      return;
    }
    try {
      const noteData = {
        storyid: Number(storyid),
        title,
        content,
      };
      await axios.post("/notes", noteData);
      toast.success("노트가 저장되었습니다.");
      noteTitleRef.current.value = "";
      noteContentRef.current.value = "";
    } catch (e) {
      toast.error("노트 저장 실패");
    }
  }, [storyid]);

  // 튜터 
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

  // 언어 선택 
  const languageSelector = useMemo(
    () => (
      <div className="div6">
        <select
          value="ko"
          onChange={() => {}}
          className="language-select"
        >
          <option value="ko">한국어</option>
        </select>
      </div>
    ),
    []
  );

  return (
    <section className="learn-section">
      {/* 상단 X 버튼 */}
      <button className="close-button" onClick={handleCloseClick}>
        <img src="/img/learn/close.png" alt="close" />
      </button>

      {/* div1: 처음부터 읽기 */}
      <div className="div1" onClick={handleReadFromStart}>
        <span className="read-start">처음부터 읽기</span>
      </div>

      {/* div2: 타이틀(기존 로직 유지) */}
      <div className="div2">
        <h3 className="story-title">{currentStory?.storytitle || "Story"}</h3>
        <span className="level-badge">{currentLangLevel}</span>
      </div>

      {/* div3: 이미지/오디오/프로그레스 */}
      <div className="div3">
        <div className="story-image-container">
          <img className="story-img" src={image} alt="page" />
        </div>

        <AudioPlayer
          pages={pages}
          pageNum={pageNum}
          setPageNum={setPageNum}
          autoAdvance
        />
      </div>

      {/* div4/5: 단어/문법 */}
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

      {/* div6: 언어 선택 */}
      {languageSelector}

      {/* div7: 노트 (항상 활성화) */}
      <div className="div7">
        <div className="note-box">
          <div className="title-row">
            <h4 className="note-title">노트</h4>
            <input
              ref={noteTitleRef}
              className="note-input"
              placeholder="노트 제목을 입력하세요"
            />
          </div>
          <textarea
            ref={noteContentRef}
            className="note-textarea"
            placeholder="노트 내용을 입력하세요"
          />
          <button className="save-note" onClick={saveNote}>
            노트 저장
          </button>
        </div>
      </div>

      {/* div8: 튜터 (항상 활성화) */}
      <div className="div8">
        <div className="chat-box">
          <div className="chat-messages">
            {chatMessages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.type}`}>
                {m.content}
              </div>
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
            <button className="chat-send" onClick={handleChatSend} disabled={isChatLoading}>
              보내기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

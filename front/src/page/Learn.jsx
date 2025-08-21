// front/src/pages/Learn.jsx
import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { StoryContext } from "../context/StoryContext";
import AudioPlayer from "../component/AudioPlayer";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../style/StoryLearn.css';
import '../style/Learn.css';
import '../style/Note.css';
import '../style/PolaChat.css';

function Learn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const noteTitleRef = useRef(null);
  const noteContentRef = useRef(null);
  const chatInputRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [caption, setCaption] = useState('');
  const [nation, setNation] = useState('en');
  const [languageData, setLanguageData] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const storyid = searchParams.get('storyid') || 1;
  const langLabel = { ko: '한국어', fr: '프랑스어', ja: '일본어', en: '영어', es: '스페인어', de: '독일어' };

  const { user } = useContext(AuthContext);
  const storyContext = useContext(StoryContext);
  const story = storyContext?.story || [];
  const currentStoryId = pages[pageNum - 1]?.storyid || pages[0]?.storyid || storyid;
  const currentStoryObj = story?.find(s => s.storyid === Number(currentStoryId));

  const goPrev = () => setPageNum(p => Math.max(p - 1, 1));
  const goNext = () => setPageNum(prev => Math.min(prev + 1, pages.length));
  const handleReadFromStart = () => setPageNum(1);
  const handleCloseClick = () => navigate(-1);

  useEffect(() => {
    fetch(`/learn/${storyid}?nation=${nation}`)
      .then(res => res.json())
      .then(result => {
        setPages(result.pages || []);
        setLanguageData(result.language || []);
        if (result.pages?.[0]?.caption) setCaption(result.pages[0].caption);
      })
      .catch(() => {
        const dummyPages = [
          {
            pageid: 1,
            storyid: Number(storyid),
            pagenumber: 1,
            nation: nation,
            imagepath: 'img/learn/lily_1.png',
            audiopath: 'audio/lily_1_' + nation + '.mp3',
            caption: `Lily is a little girl. She wakes up when the sun comes up.\nShe opens her eyes and smiles. \"Good morning!\" she says.\nToday will be a happy day!`
          },
          {
            pageid: 2,
            storyid: Number(storyid),
            pagenumber: 2,
            nation: nation,
            imagepath: 'img/learn/lily_1.png',
            audiopath: 'audio/lily_2_' + nation + '.mp3',
            caption: `Lily gets out of bed. She goes to the bathroom.\nShe brushes her teeth with her blue toothbrush. Then she washes her face.\nShe feels fresh and ready.`
          }
        ];
        setPages(dummyPages);
        setCaption(dummyPages[0].caption);
        setLanguageData([
          { grammar: "Be동사 + 명사 : ~이다", voca: "Lily : (명사) 사람 이름 , little : (형용사) 작은/어린 , girl : (명사) 소녀" },
          { grammar: "일반동사(wake up) + when절 : ~할 때 / and로 동사 연결", voca: "wakes up : (동사) 일어나다 , sun : (명사) 해 , comes up : (동사구) 떠오르다" },
          { grammar: "and로 동사 연결", voca: "opens : (동사) 열다 , her eyes : (대명사+명사) 그녀의 눈 , smiles : (동사) 미소짓다" },
          { grammar: "감탄문, 인사 표현", voca: "Good morning : (인사) 좋은 아침 , says : (동사) 말하다" }
        ]);
      });
  }, [nation, storyid]);

  useEffect(() => {
    const newCaption = pages[pageNum - 1]?.caption;
    if (newCaption) setCaption(newCaption);
  }, [pages, pageNum]);

  const formatCaption = text => text?.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line.trim()}</p>);
  const getCorrectImagePath = (path) => path || 'img/learn/placeholder.png';

  const handleSendChat = async () => {
    const input = chatInput.trim();
    if (!input) return;

    const newMessages = [...chatMessages, { type: "user", content: input }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const res = await fetch("/api/tutor/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      if (res.ok && data?.content) {
        setChatMessages((prev) => [...prev, { type: "tutor", content: data.content }]);
      } else {
        toast.error("GPT 응답 실패");
      }
    } catch (e) {
      toast.error("서버 오류");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  const handleSaveChatToNote = async () => {
    if (!user) return toast.error("로그인이 필요합니다.");
    if (chatMessages.length === 0) return toast.warn("대화가 없습니다.");

    const filteredMessages = chatMessages.filter(
      (m) => m.content && !m.content.includes("AI tutor Pola에게")
    );
    if (filteredMessages.length === 0) return toast.warn("대화가 없습니다.");

    const title = `[튜터노트] ${new Date().toLocaleString()}`;
    const content = filteredMessages
      .map((m) => (m.type === "user" ? `🙋 ${m.content}` : `🤖 ${m.content}`))
      .join("\n");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          storyid: currentStoryId,
          nation,
          title,
          content
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("채팅 내용이 노트로 저장되었습니다.");
        setChatMessages([]);
      } else {
        toast.error(data.message || "노트 저장 실패");
      }
    } catch (err) {
      toast.error("서버 오류: 저장 실패");
    }
  };

  return (
    <div className="parent">
      {/* 생략된 div1 ~ div6 ... */}

      <div className="div8">
        <div>
          <div className="tutor-lang-select">
            <span className="tutor-info">채팅 내역은 저장되지 않습니다.</span>
            <span className="tutor-info notelang" onClick={handleSaveChatToNote}>노트로 저장</span>
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
            disabled={isChatLoading}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleChatKeyDown}
          />
          <button className="chat-send" onClick={handleSendChat} disabled={isChatLoading || !chatInput.trim()}>
            <img src="/img/learn/send.png" alt="send button" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Learn;

// src/pages/MyNotes.jsx
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LevelsContext } from "../context/LevelsContext";
import { StoryContext } from "../context/StoryContext";
import "../style/MyNotes.css";
import "../style/Note.css";


export default function MyNotes() {
  const navigate = useNavigate();
  const { storyid } = useParams();
  const levelsContext = useContext(LevelsContext);
  const levels = levelsContext?.levels || [];
  const levelLabelsKo = levelsContext?.levelLabelsKo || {};
  const { user, token } = useContext(AuthContext);
  const { stories } = useContext(StoryContext);

  const goBack = () => navigate(storyid ? "/mynotes" : -1);

  const [selected, setSelected] = useState(levels[0] || "A1");
  const [notesData, setNotesData] = useState([]);
  const [specificNotes, setSpecificNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyTitle, setStoryTitle] = useState("");

  // 이미지 URL 생성 함수
  const getImageUrl = (path) => {
    if (!path) return "../img/home/no_image.png";
    const baseUrl = process.env.REACT_APP_IMAGE_BASE_URL || "http://localhost:3000";
    // 절대 경로 or 업로드 경로 처리
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `${baseUrl}${path}`;
    return `${baseUrl}/${path}`;
  };

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const userid = user?.userid;
        if (!userid || !token) {
          setLoading(false);
          alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
          navigate("/login");
          return;
        }

        const response = await fetch(`http://localhost:3000/notes/${userid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 403 || response.status === 401) {
          setLoading(false);
          alert("접근 권한이 없습니다. 다시 로그인 해주세요.");
          navigate("/login");
          return;
        }

        const result = await response.json();
        if (result.message === "ok") {
          const allNotes = result.data;

          if (storyid) {
            const storyResponse = await fetch(
              `http://localhost:3000/stories/A1/detail/${storyid}`
            );
            const storyResult = await storyResponse.json();

            if (storyResponse.ok && storyResult.message === "Story detail retrieval successful") {
              const storyData = storyResult.data;
              setStoryTitle(storyData.storytitle);

              const storyNotes = allNotes.filter(
                (note) => String(note.storyid) === String(storyid)
              );
              setSpecificNotes(storyNotes);
            } else {
              alert("스토리 정보를 가져오는데 실패했습니다.");
            }
          } else {
            const groupedNotes = allNotes.reduce((acc, note) => {
              const storyId = String(note.storyid);
              if (!acc[storyId]) {
                acc[storyId] = {
                  storyid: storyId,
                  title: note.storytitle || `Story ${storyId}`,
                  level: note.langlevel || "A1",
                  image: getImageUrl(note.storycoverpath),
                  noteCount: 0,
                  notes: [],
                };
              }
              acc[storyId].noteCount++;
              acc[storyId].notes.push(note);
              return acc;
            }, {});
            setNotesData(Object.values(groupedNotes));
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("노트 데이터 로딩 실패:", error);
        setLoading(false);
      }
    };

    fetchNotes();
  }, [storyid, user?.userid, token, navigate]);

  const handleSelect = (level) => {
    setSelected((prev) => (prev === level ? null : level));
  };

  const filteredStories = selected
    ? notesData.filter((story) => story.level === selected)
    : notesData;

  if (loading) {
    return (
      <div className="mynotes-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={goBack}>
            🔙
          </button>
          <h1 className="page-title">
            {storyid ? `${storyTitle} - 내 노트` : "내가 작성한 노트들"}
          </h1>
        </div>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (storyid) {
    const storyObj = stories?.find((s) => String(s.storyid) === String(storyid));
    const storyImage = getImageUrl(storyObj?.thumbnail || storyObj?.storycoverpath);

    return (
      <div className="mynotes-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={goBack}>
            🔙
          </button>
          <h1 className="page-title">
            {storyTitle ? `${storyTitle} - 내 노트` : "내가 작성한 노트들"}
          </h1>
        </div>
        <div className="notes-display-container">
          <div className="image-box">
            <img src={storyImage} alt={storyTitle} />
          </div>
          {specificNotes.length === 0 ? (
            <p className="no-notes">이 스토리에 대한 노트가 없습니다.</p>
          ) : (
            specificNotes.map((note) => {
              let dateStr = "";
              if (note.createdat) {
                const dateObj = new Date(note.createdat);
                dateStr = isNaN(dateObj.getTime())
                  ? ""
                  : dateObj.toLocaleDateString();
              }
              return (
                <div key={note.noteid} className="note-box-display note-box-narrow">
                  <div className="note-head">
                    <strong>Note</strong>
                    <span className="note-date-header">{dateStr}</span>
                  </div>
                  <div className="note-title">
                    <label className="underline-note">Title :</label>
                    <input
                      className="note-input underline note-title-display"
                      value={note.title}
                      readOnly
                    />
                  </div>
                  <div className="note-content-display">{note.content}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mynotes-container">
      <div className="back-button-wrapper">
        <button className="back-button" onClick={goBack}>
          🔙
        </button>
        <h1 className="page-title">내가 작성한 노트들</h1>
      </div>
      <div className="level-buttons">
        {levels.map((level) => {
          const isSelected = selected === level;
          return (
            <button
              key={level}
              onClick={() => handleSelect(level)}
              className={`level-btn ${level} ${isSelected ? `selected ${level}` : ""}`}
            >
              <strong>{level}</strong>
              <br />
              <span>{levelLabelsKo[level]}</span>
            </button>
          );
        })}
      </div>
      <div className="image-grid">
        {filteredStories.map(({ storyid, title, level, image, noteCount }) => {
          const storyObj = stories?.find((s) => String(s.storyid) === String(storyid));
          const storyImage = getImageUrl(storyObj?.thumbnail || storyObj?.storycoverpath || image);
          const storyTitle = storyObj?.storytitle || title;

          return (
            <div key={storyid} className="image-box">
              <Link to={`/mynotes/${storyid}`}>
                <img src={storyImage} alt={storyTitle} />
              </Link>
              <p className="image-title">{storyTitle}</p>
              <p className="note-count">{noteCount}개의 노트</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
